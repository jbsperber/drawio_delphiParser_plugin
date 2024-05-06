function parseCallstackToActivityDiagram(text, ui) {
    var cells = createStackTraceElements(text);
    if (cells.length > 0) {
        cells = updateGraph(ui, cells);
    }
}

function createStackTraceElements(stackText) {
    var vertices = new Object();
    var cells = [];
    var currentLine = null;
    var lastItemId = -1;

    var it = new StackLinesIterator(stackText);
    while (currentLine = it.getNextLine()) {
        var itemId = it.currentIndex;
        currentLine = splitDotText(currentLine);        
        var target = createStackStep(itemId, currentLine);
        vertices[itemId] = target;
        cells.push(target);

        var edge = createLinkBetweenSteps(vertices, lastItemId, target);        
        if(edge!=null){
            cells.push(edge);
        }

        lastItemId = itemId;
    }

    return cells;
}

function splitDotText(dotText) {
    var splitText = dotText;
    var firstDotPos = splitText.indexOf(".");
    var lastDotPos = splitText.lastIndexOf(".");
    while ((firstDotPos != lastDotPos) && (firstDotPos != -1)) {
        splitText = splitText.substr(firstDotPos + 1);
        firstDotPos = splitText.indexOf(".");
        lastDotPos = splitText.lastIndexOf(".");
    }
    if (firstDotPos != -1) {
        splitText = splitText.replace(".",".\n");
    }
    return splitText;
}

function createStackStep(id, stackLine) {
    var vertex = new mxCell(id, new mxGeometry(0, 0, 80, 40), 'whiteSpace=wrap;html=1;');
    vertex.id = id;
    vertex.value = stackLine;
    vertex.vertex = true;
    return vertex;
}

function createLinkBetweenSteps(vertices, sourceId, target) {
    var edge = null;
    var source = vertices[sourceId];
    if (source != null) {
        edge = new mxCell('', new mxGeometry());
        edge.edge = true;
        source.insertEdge(edge, true);
        target.insertEdge(edge, false);
        applyRecursionStyle(target, source);
    }
    return edge;
}

function applyRecursionStyle(target, source) {
    if (target.value == source.value)
        target.style = 'whiteSpace=wrap;html=1;strokeColor=#d6b656;fillColor=#fff2cc';
}

function updateGraph(ui, cells) {
    var graph = ui.editor.graph;

    try {
        graph.getModel().beginUpdate();

        var insertPoint = graph.getFreeInsertPoint();
        cells = graph.importCells(cells,insertPoint.x, insertPoint.y);

        updateCellsSize(cells, graph);
        updateLayout(graph);

        graph.clearCellOverlays();
        graph.fireEvent(new mxEventObject('cellsInserted', 'cells', cells));
    }
    finally {
        graph.getModel().endUpdate();
    }

    graph.setSelectionCells(cells);
    graph.scrollCellToVisible(graph.getSelectionCell());
}

function updateLayout(graph) {
    var layout = new mxCompactTreeLayout(graph);
    layout.edgeRouting = false;
    layout.horizontal = false;
    layout.levelDistance = 20;
    layout.execute(graph.getDefaultParent());

    var edgeLayout = new mxParallelEdgeLayout(graph);
    edgeLayout.spacing = 20;
    edgeLayout.execute(graph.getDefaultParent());
}

function updateCellsSize(cells, graph) {
    for (var i = 0; i < cells.length; i++) {
        if (graph.getModel().isVertex(cells[i])) {
            var size = graph.getPreferredSizeForCell(cells[i]);
            cells[i].geometry.width = Math.max(cells[i].geometry.width, size.width);
            cells[i].geometry.height = Math.max(cells[i].geometry.height, size.height);
        }
    }
}

class StackLinesIterator {

    clearLineText(stackLine) {
        if (stackLine.includes('('))
            stackLine = stackLine.substring(0, stackLine.indexOf('('));
        return stackLine.trim();
    }

    constructor(text) {
        this.lines = text.split('\n');
        this.currentIndex = this.lines.length;

        var self = this;
        this.getNextLine = function () {
            if (self.currentIndex > 0) {
                self.currentIndex = self.currentIndex - 1;
                var currentLine = self.lines[self.currentIndex];
                if (currentLine && (currentLine = self.clearLineText(currentLine))) {
                    if (currentLine.charAt(0) != ';') {
                        return currentLine;
                    }
                }
                return self.getNextLine();
            }
            else {
                return null;
            }
        };
    }
}

export {
    parseCallstackToActivityDiagram,
    StackLinesIterator
}
