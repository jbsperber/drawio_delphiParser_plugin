import DelphiClass from "./delphiClass.js";
import { DelphiMethodCollection, CreateNewMethod } from "./delphiMethod.js";

class DelphiUnit {
    constructor() {
        this.name = '';
        this.methods = new DelphiMethodCollection();
        this.classes = [];
        this.properties = [];
    }
}

function parseTextToUnit(text) {
    if (!text.length > 0)
        return null;
    else {

        var unit = new DelphiUnit();

        var accessChar = '+';
        var currentClass = null;
        var currentLine = null;
        var isImplementation = false;
        var reachedMethodsInImplementation = false;

        var it = new LinesIterator(text);

        while (currentLine = it.getNextLine()) {
            var currentLineUpperCase = currentLine.replace(/\s/g, '').toUpperCase();

            if (!isImplementation) {
                if (currentLineUpperCase.startsWith('UNIT')) {
                    unit.name = currentLine.substring(currentLine.indexOf(' ') + 1, currentLine.indexOf(';'));
                }
                else if (currentLineUpperCase.includes('=CLASS') || currentLineUpperCase.includes('=INTERFACE(')) //found a new class
                {
                    var accessChar = '-';
                    //currentLine = currentLine.replace(/\s/g, '');
                    var className = currentLine.substring(0, currentLine.indexOf('='));

                    currentClass = new DelphiClass(className);

                    if (currentLine.includes('('))
                        currentClass.parentClass = currentLine.substring(currentLine.indexOf('(') + 1, currentLine.indexOf(')'));

                    unit.classes.push(currentClass);
                }
                else if (currentLineUpperCase.startsWith('PRIVATE')) {
                    accessChar = '-';
                }
                else if (currentLineUpperCase.startsWith('PUBLIC')) {
                    accessChar = '+';
                }
                else if (currentLineUpperCase.startsWith('PROTECTED')) {
                    accessChar = '#';
                }
                else if (currentLineUpperCase.startsWith('PROPERTY')) {
                    var propName = accessChar + getItemName(currentLine);

                    if (currentClass)
                        currentClass.properties.push(propName);
                    else
                        unit.properties.push(propName);
                }
                else if (currentLineUpperCase.startsWith('PROCEDURE') || currentLineUpperCase.startsWith('FUNCTION') || currentLineUpperCase.startsWith('CONSTRUCTOR')) {
                    var itemLine = accessChar + getItemName(currentLine);

                    if (itemLine.includes('(') && !itemLine.includes(')')) {
                        //multi line declaration
                        do {
                            currentLine = it.getNextLine();
                            itemLine = itemLine + removeComments(currentLine)
                        } while (!currentLine.includes(')'));
                    }

                    var method = CreateNewMethod(itemLine, currentLineUpperCase.startsWith('FUNCTION'));

                    if (currentClass) {
                        currentClass.methods.addMethod(method);
                    }
                    else {
                        unit.methods.addMethod(method);
                    }
                }

                else if (currentLineUpperCase.includes('END;')) {
                    currentClass = null;
                    currentLineUpperCase = '';
                }
                else if (currentLineUpperCase.includes(':')) { // possibly a field                
                    var newField = createField(currentLine, accessChar);
                    if (currentClass)
                        currentClass.fields.push(newField);
                    else
                        unit.properties.push(newField);
                }
                else if (currentLineUpperCase.startsWith('IMPLEMENTATION')) {
                    isImplementation = true;
                    accessChar = '-';
                }
            }

            else {
                if (currentLineUpperCase.startsWith('PROCEDURE') || currentLineUpperCase.startsWith('FUNCTION') || currentLineUpperCase.startsWith('CONSTRUCTOR')) {
                    reachedMethodsInImplementation = true;
                    var itemName = accessChar + getItemName(currentLine);
                    if (!itemName.includes(".")) {
                        //multi line declaration                        
                        while (!itemName.includes(';')) {
                            currentLine = it.getNextLine();
                            itemName = itemName + removeComments(currentLine)
                        }
                        if (itemName.includes('(') && !itemName.includes(')')) {
                            //multi line declaration
                            do {
                                currentLine = it.getNextLine();
                                itemName = itemName + removeComments(currentLine)
                            } while (!currentLine.includes(')'));
                        }
                        var method = CreateNewMethod(itemName, currentLineUpperCase.startsWith('FUNCTION'));
                        unit.methods.addMethod(method);
                    }
                }

                else if (!reachedMethodsInImplementation && currentLineUpperCase.includes(':')) { // possibly a field                
                    //var fieldName = createField(currentLine);
                    unit.properties.push(currentLine);
                }
            }
        }

        return unit;
    }
}

function getItemName(line) {
    var itemName = line.substring(line.indexOf(' ')).trim();
    return removeComments(itemName);
}

function removeComments(line) {
    if (line.includes('//')) {
        line = line.substring(0, line.indexOf('//')).trim();
    }
    return line;
}

function createField(line,accessChar) {
    var fieldName = accessChar + line.substring(0, line.indexOf(':')).trim();
    var fieldType = line.substring(line.indexOf(':') + 1, line.indexOf(';')).trim()

    if (line.includes('=')) { //cosntant declarations
        var fieldType = line.substring(line.indexOf(':') + 1, line.indexOf('=')).trim()
    }
    else {
        fieldType = line.substring(line.indexOf(':') + 1, line.indexOf(';')).trim()
    }

    return { fieldName, fieldType };
}

class LinesIterator {
    constructor(text) {
        this.lines = text.split('\n');
        this.currentIndex = -1;

        var self = this;
        this.getNextLine = function (isInsideComment = false) {
            if (self.currentIndex < self.lines.length) {
                self.currentIndex = self.currentIndex + 1;

                var currentLine = self.lines[self.currentIndex];
                if (currentLine && (currentLine = currentLine.trim())) {
                    if (!isInsideComment && !currentLine.startsWith('//') && !currentLine.startsWith('{')) {
                        return currentLine;
                    }
                    else {
                        if ((isInsideComment || currentLine.startsWith('{')) && !currentLine.includes('}')) {
                            isInsideComment = true;
                        }
                        return self.getNextLine(isInsideComment);
                    }
                }
                else {
                    return self.getNextLine(isInsideComment);
                }
            }
            else {
                return null;
            }
        };
    }
}

export { parseTextToUnit }