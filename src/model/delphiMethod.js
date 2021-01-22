
function CreateNewMethod(line, hasReturnType) {
    //line = line.replace(/\s/g, '');
    var method = new DelphiMethod();
    method.originalLine = line;

    if (hasReturnType) {
        method.returnType = line.substring(line.lastIndexOf(':') + 1);
    }
    else {
        method.returnType = 'void';
    }

    if (line.includes('(')) {
        method.name = line.substring(1, line.indexOf('('));

        var argumentsBlocks = line.substring(line.indexOf('(') + 1, line.indexOf(')')).split(';');
        argumentsBlocks.forEach(b => {
            var argumentType = b.substring(b.indexOf(':') + 1);
            var args = b.substring(0, b.indexOf(':')).split(",");
            args.forEach(a => {
                method.arguments.push(new DelphiMethodArgument(a, argumentType));
            });
        });
    }
    else {
        if (line.includes(':')) {
            method.name = line.substring(1, line.indexOf(':'));
        }
        else {
            method.name = line.substring(1, line.indexOf(';'));
        }
    }

    return method;
}

class DelphiMethod {

    constructor() {
        this.originalLine = '';
        this.name = '';
        this.returnType = '';
        this.arguments = [];
    }

    isEqualTo(method) {
        var isEqual = this.name == method.name && this.returnType == method.returnType;

        if (isEqual) {
            isEqual = this.hasSameArguments(method);
        }

        return isEqual;
    }

    hasSameArguments(method) {
        if (this.arguments.length == method.arguments.length) {
            for (let i = 0; i < this.arguments.length; i++) {
                if (this.arguments[i].name != method.arguments[i].name || this.arguments[i].type != method.arguments[i].type)
                    return false;
            }
            return true;
        }
        else
            return false;
    }
}

class DelphiMethodArgument {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
}

class DelphiMethodCollection {
    constructor() {
        this.methodsList = [];
    }

    addMethod(method) {
        if (!this.methodsList.some(m => { return m.isEqualTo(method); })) {
            this.methodsList.push(method);
        }
    }
}

export { CreateNewMethod, DelphiMethod, DelphiMethodArgument, DelphiMethodCollection }