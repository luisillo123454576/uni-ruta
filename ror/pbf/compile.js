'use strict';

module.exports = compile;

var version = require('./package.json').version;

function compile(proto) {
    var code = 'var exports = {};\n';
    code += compileRaw(proto) + '\n';
    code += 'return exports;\n';
    return new Function(code)();
}

compile.raw = compileRaw;

function compileRaw(proto, options) {
    var pre = '\'use strict\'; // code generated by pbf v' + version + '\n';
    var context = buildDefaults(buildContext(proto, null), proto.syntax);
    return pre + writeContext(context, options || {});
}

function writeContext(ctx, options) {
    var code = '';
    if (ctx._proto.fields) code += writeMessage(ctx, options);
    if (ctx._proto.values) code += writeEnum(ctx, options);

    for (var i = 0; i < ctx._children.length; i++) {
        code += writeContext(ctx._children[i], options);
    }
    return code;
}

function writeMessage(ctx, options) {
    var name = ctx._name;
    var fields = ctx._proto.fields;
    var numRepeated = 0;

    var code = '\n// ' + name + ' ========================================\n\n';

    if (!options.noRead || !options.noWrite) {
        code += compileExport(ctx, options) + ' {};\n\n';
    }

    if (!options.noRead) {
        code += name + '.read = function (pbf, end) {\n';
        code += '    return pbf.readFields(' + name + '._readField, ' + compileDest(ctx) + ', end);\n';
        code += '};\n';
        code += name + '._readField = function (tag, obj, pbf) {\n';

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var readCode = compileFieldRead(ctx, field);
            var packed = willSupportPacked(ctx, field);
            code += '    ' + (i ? 'else if' : 'if') +
                ' (tag === ' + field.tag + ') ' +
                (field.type === 'map' ? ' { ' : '') +
                (
                    field.type === 'map' ? compileMapRead(readCode, field.name, numRepeated++) :
                    field.repeated && !packed ? 'obj.' + field.name + '.push(' + readCode + ')' :
                    field.repeated && packed ? readCode : 'obj.' + field.name + ' = ' + readCode
                );

            if (field.oneof) {
                code += ', obj.' + field.oneof + ' = ' + JSON.stringify(field.name);
            }

            code += ';' + (field.type === 'map' ? ' }' : '') + '\n';
        }
        code += '};\n';
    }

    if (!options.noWrite) {
        code += name + '.write = function (obj, pbf) {\n';
        numRepeated = 0;
        for (i = 0; i < fields.length; i++) {
            field = fields[i];
            var writeCode = field.repeated && !isPacked(field) ?
                compileRepeatedWrite(ctx, field, numRepeated++) :
                field.type === 'map' ? compileMapWrite(ctx, field, numRepeated++) :
                compileFieldWrite(ctx, field, 'obj.' + field.name);
            code += getDefaultWriteTest(ctx, field);
            code += writeCode + ';\n';
        }
        code += '};\n';
    }
    return code;
}

function getEnumValues(ctx) {
    var enums = {};
    var ids = Object.keys(ctx._proto.values);
    for (var i = 0; i < ids.length; i++) {
        enums[ids[i]] = ctx._proto.values[ids[i]].value;
    }
    return enums;
}

function writeEnum(ctx, options) {
    return '\n' + compileExport(ctx, options) + ' ' +
        JSON.stringify(getEnumValues(ctx), null, 4) + ';\n';
}

function compileExport(ctx, options) {
    var exportsVar = options.exports || 'exports';
    return (ctx._root ? 'var ' + ctx._name + ' = ' + exportsVar + '.' : '') + ctx._name + ' =';
}

function compileDest(ctx) {
    var props = {};
    for (var i = 0; i < ctx._proto.fields.length; i++) {
        var field = ctx._proto.fields[i];
        props[field.name + ': ' + JSON.stringify(ctx._defaults[field.name])] = true;
        if (field.oneof) props[field.oneof + ': undefined'] = true;
    }
    return '{' + Object.keys(props).join(', ') + '}';
}

function isEnum(type) {
    return type && type._proto.values;
}

function getType(ctx, field) {
    if (field.type === 'map') {
        return ctx[getMapMessageName(field.tag)];
    }

    var path = field.type.split('.');
    return path.reduce(function(ctx, name) { return ctx && ctx[name]; }, ctx);
}

function fieldShouldUseStringAsNumber(field) {
    if (field.options.jstype === 'JS_STRING') {
        switch (field.type) {
        case 'float':
        case 'double':
        case 'uint32':
        case 'uint64':
        case 'int32':
        case 'int64':
        case 'sint32':
        case 'sint64':
        case 'fixed32':
        case 'fixed64':
        case 'sfixed32':
        case 'sfixed64': return true;
        default:         return false;
        }
    }
    return false;
}

function compileFieldRead(ctx, field) {
    var type = getType(ctx, field);
    if (type) {
        if (type._proto.fields) return type._name + '.read(pbf, pbf.readVarint() + pbf.pos)';
        if (!isEnum(type)) throw new Error('Unexpected type: ' + type._name);
    }

    var fieldType = isEnum(type) ? 'enum' : field.type;

    var prefix = 'pbf.read';
    var signed = fieldType === 'int32' || fieldType === 'int64' ? 'true' : '';
    var suffix = '(' + signed + ')';

    if (willSupportPacked(ctx, field)) {
        prefix += 'Packed';
        suffix = '(obj.' + field.name + (signed ? ', ' + signed : '') + ')';
    }

    if (fieldShouldUseStringAsNumber(field)) {
        suffix += '.toString()';
    }

    switch (fieldType) {
    case 'string':   return prefix + 'String' + suffix;
    case 'float':    return prefix + 'Float' + suffix;
    case 'double':   return prefix + 'Double' + suffix;
    case 'bool':     return prefix + 'Boolean' + suffix;
    case 'enum':
    case 'uint32':
    case 'uint64':
    case 'int32':
    case 'int64':    return prefix + 'Varint' + suffix;
    case 'sint32':
    case 'sint64':   return prefix + 'SVarint' + suffix;
    case 'fixed32':  return prefix + 'Fixed32' + suffix;
    case 'fixed64':  return prefix + 'Fixed64' + suffix;
    case 'sfixed32': return prefix + 'SFixed32' + suffix;
    case 'sfixed64': return prefix + 'SFixed64' + suffix;
    case 'bytes':    return prefix + 'Bytes' + suffix;
    default:         throw new Error('Unexpected type: ' + field.type);
    }
}

function compileFieldWrite(ctx, field, name) {
    var prefix = 'pbf.write';
    if (isPacked(field)) prefix += 'Packed';

    if (fieldShouldUseStringAsNumber(field)) {
        if (field.type === 'float' || field.type === 'double') {
            name = 'parseFloat(' + name + ')';
        } else {
            name = 'parseInt(' + name + ', 10)';
        }
    }
    var postfix = (isPacked(field) ? '' : 'Field') + '(' + field.tag + ', ' + name + ')';

    var type = getType(ctx, field);
    if (type) {
        if (type._proto.fields) return prefix + 'Message(' + field.tag + ', ' + type._name + '.write, ' + name + ')';
        if (type._proto.values) return prefix + 'Varint' + postfix;
        throw new Error('Unexpected type: ' + type._name);
    }

    switch (field.type) {
    case 'string':   return prefix + 'String' + postfix;
    case 'float':    return prefix + 'Float' + postfix;
    case 'double':   return prefix + 'Double' + postfix;
    case 'bool':     return prefix + 'Boolean' + postfix;
    case 'enum':
    case 'uint32':
    case 'uint64':
    case 'int32':
    case 'int64':    return prefix + 'Varint' + postfix;
    case 'sint32':
    case 'sint64':   return prefix + 'SVarint' + postfix;
    case 'fixed32':  return prefix + 'Fixed32' + postfix;
    case 'fixed64':  return prefix + 'Fixed64' + postfix;
    case 'sfixed32': return prefix + 'SFixed32' + postfix;
    case 'sfixed64': return prefix + 'SFixed64' + postfix;
    case 'bytes':    return prefix + 'Bytes' + postfix;
    default:         throw new Error('Unexpected type: ' + field.type);
    }
}

function compileMapRead(readCode, name, numRepeated) {
    return (numRepeated ? '' : 'var ') + 'entry = ' + readCode + '; obj.' + name + '[entry.key] = entry.value';
}

function compileRepeatedWrite(ctx, field, numRepeated) {
    return 'for (' + (numRepeated ? '' : 'var ') +
        'i = 0; i < obj.' + field.name + '.length; i++) ' +
        compileFieldWrite(ctx, field, 'obj.' + field.name + '[i]');
}

function compileMapWrite(ctx, field, numRepeated) {
    var name = 'obj.' + field.name;

    return 'for (' + (numRepeated ? '' : 'var ') +
        'i in ' + name + ') if (Object.prototype.hasOwnProperty.call(' + name + ', i)) ' +
        compileFieldWrite(ctx, field, '{ key: i, value: ' + name + '[i] }');
}

function getMapMessageName(tag) {
    return '_FieldEntry' + tag;
}

function getMapField(name, type, tag) {
    return {
        name: name,
        type: type,
        tag: tag,
        map: null,
        oneof: null,
        required: false,
        repeated: false,
        options: {}
    };
}

function getMapMessage(field) {
    return {
        name: getMapMessageName(field.tag),
        enums: [],
        messages: [],
        extensions: null,
        fields: [
            getMapField('key', field.map.from, 1),
            getMapField('value', field.map.to, 2)
        ]
    };
}

function buildContext(proto, parent) {
    var obj = Object.create(parent);
    obj._proto = proto;
    obj._children = [];
    obj._defaults = {};

    if (parent) {
        parent[proto.name] = obj;

        if (parent._name) {
            obj._root = false;
            obj._name = parent._name + '.' + proto.name;
        } else {
            obj._root = true;
            obj._name = proto.name;
        }
    }

    for (var i = 0; proto.enums && i < proto.enums.length; i++) {
        obj._children.push(buildContext(proto.enums[i], obj));
    }

    for (i = 0; proto.messages && i < proto.messages.length; i++) {
        obj._children.push(buildContext(proto.messages[i], obj));
    }

    for (i = 0; proto.fields && i < proto.fields.length; i++) {
        if (proto.fields[i].type === 'map') {
            obj._children.push(buildContext(getMapMessage(proto.fields[i]), obj));
        }
    }

    return obj;
}

function getDefaultValue(field, value) {
    // Defaults not supported for repeated fields
    if (field.repeated) return [];
    var convertToStringIfNeeded = function(val) { return val; };
    if (fieldShouldUseStringAsNumber(field)) {
        convertToStringIfNeeded = function(val) { return val.toString(); };
    }

    switch (field.type) {
    case 'float':
    case 'double':   return convertToStringIfNeeded(value ? parseFloat(value) : 0);
    case 'uint32':
    case 'uint64':
    case 'int32':
    case 'int64':
    case 'sint32':
    case 'sint64':
    case 'fixed32':
    case 'fixed64':
    case 'sfixed32':
    case 'sfixed64': return convertToStringIfNeeded(value ? parseInt(value, 10) : 0);
    case 'string':   return value || '';
    case 'bool':     return value === 'true';
    case 'map':      return {};
    default:         return undefined;
    }
}

function willSupportPacked(ctx, field) {
    var fieldType = isEnum(getType(ctx, field)) ? 'enum' : field.type;

    switch (field.repeated && fieldType) {
    case 'float':
    case 'double':
    case 'uint32':
    case 'uint64':
    case 'int32':
    case 'int64':
    case 'sint32':
    case 'sint64':
    case 'fixed32':
    case 'fixed64':
    case 'sfixed32':
    case 'enum':
    case 'bool': return true;
    }

    return false;
}

function setPackedOption(ctx, field, syntax) {
    // No default packed in older protobuf versions
    if (syntax < 3) return;

    // Packed option already set
    if (field.options.packed !== undefined) return;

    // Not a packed field type
    if (!willSupportPacked(ctx, field)) return;

    field.options.packed = 'true';
}

function setDefaultValue(ctx, field, syntax) {
    var options = field.options;
    var type = getType(ctx, field);
    var enumValues = type && type._proto.values && getEnumValues(type);

    // Proto3 does not support overriding defaults
    var explicitDefault = syntax < 3 ? options.default : undefined;

    // Set default for enum values
    if (enumValues && !field.repeated) {
        ctx._defaults[field.name] = enumValues[explicitDefault] || 0;

    } else {
        ctx._defaults[field.name] = getDefaultValue(field, explicitDefault);
    }
}

function buildDefaults(ctx, syntax) {
    var proto = ctx._proto;

    for (var i = 0; i < ctx._children.length; i++) {
        buildDefaults(ctx._children[i], syntax);
    }

    if (proto.fields) {
        for (i = 0; i < proto.fields.length; i++) {
            setPackedOption(ctx, proto.fields[i], syntax);
            setDefaultValue(ctx, proto.fields[i], syntax);
        }
    }

    return ctx;
}

function getDefaultWriteTest(ctx, field) {
    var def = ctx._defaults[field.name];
    var type = getType(ctx, field);
    var code = '    if (obj.' + field.name;

    if (!field.repeated && (!type || !type._proto.fields)) {
        if (def === undefined || def) {
            code += ' != undefined';
        }
        if (def) {
            code += ' && obj.' + field.name + ' !== ' + JSON.stringify(def);
        }
    }

    return code + ') ';
}

function isPacked(field) {
    return field.options.packed === 'true';
}
