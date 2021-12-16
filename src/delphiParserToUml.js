
import { parseTextToUnit } from "./model/delphiUnit.js"

var x0 = 0;

export default function parseDelphiUnitToUml(text, ui) {
    var unit = parseTextToUnit(text);
    if (unit) {
        x0 = 0;
        var classes = [];
        var graph = ui.editor.graph;

        if (unit.name.length > 0) {
            var unitUml = createUmlForClass(graph, 'unit ' + unit.name, null, unit.properties, unit.methods);
            classes.push(unitUml);
        }

        unit.classes.forEach(c => {
            var header = c.name;
            if (unit.name.length > 0){
                header = '[' + unit.name + '] ' + header;
            }
            if (c.parentClass) {
                header = header + ' : ' + c.parentClass;
            }
            var classUml = createUmlForClass(graph, header, c.fields, c.properties, c.methods);

            classes.push(classUml);
        });

        graph.getModel().beginUpdate();
        try {
            var insertPoint = graph.getFreeInsertPoint();
            classes = graph.importCells(classes, insertPoint.x, insertPoint.y);
            var inserted = [];

            for (var i = 0; i < classes.length; i++) {
                inserted.push(classes[i]);
                inserted = inserted.concat(classes[i].children);
            }

            graph.fireEvent(new mxEventObject('cellsInserted', 'cells', inserted));
        }
        finally {
            graph.getModel().endUpdate();
        }

        graph.setSelectionCells(classes);
        graph.scrollCellToVisible(graph.getSelectionCell());
    }
}

function createUmlForMember(graph, memberText, aClass) {
    var member = new mxCell(memberText, new mxGeometry(0, 0, 60, 26), 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;');
    member.vertex = true;

    var size = graph.getPreferredSizeForCell(member);

    if (size != null && member.geometry.width < size.width) {
        member.geometry.width = size.width;
    }
    aClass.insert(member);
    aClass.geometry.width = Math.max(aClass.geometry.width, member.geometry.width);
    aClass.geometry.height += member.geometry.height;
};

function createUmlForClass(graph, header, fields, properties, methods) {

    var aClass = new mxCell(header, new mxGeometry(x0, 0, 160, 26 + 4),
        'swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;');
    aClass.vertex = true;
    var size = graph.getPreferredSizeForCell(aClass);
    if (size != null && aClass.geometry.width < size.width + 10) {
        aClass.geometry.width = size.width + 10;
    }

    if (fields) {
        fields.forEach(m => {
            createUmlForMember(graph, (m.fieldName + ': ' + m.fieldType), aClass);
        });
    }
    if (properties) {
        properties.forEach(m => {
            createUmlForMember(graph, m, aClass);
        });
    }

    if (((fields && fields.length > 0) || (properties && properties.length > 0)) && (methods && methods.methodsList.length > 0)) {
        var divider = new mxCell('', new mxGeometry(0, 0, 40, 8), 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;');
        divider.vertex = true;
        aClass.geometry.height += divider.geometry.height;
        aClass.insert(divider);
    }

    if (methods) {
        methods.methodsList.forEach(m => {
            createUmlForMember(graph, m.originalLine, aClass);
        });
    }

    x0 += aClass.geometry.width + 10;

    return aClass;
}