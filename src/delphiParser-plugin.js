import parseDelphiUnitToUml from "./delphiParserToUml";

/**
 * Parses Pascal classes to a UML Class into draw.io's canvas
 */
Draw.loadPlugin(function (ui) {
    /**
     * Constructs a new parse dialog.
     */
    var ParseDialog = function (editorUi) {
        var insertPoint = editorUi.editor.graph.getFreeInsertPoint();

        function parseAsUMLClass(text) {
            parseDelphiUnitToUml(text,ui);
        }

        function parseAsActivity(text) {
            var lines = text.split('\n');

            var vertices = new Object();
            var cells = [];
            var lastItem = -1;

            function createVertex(id, cellvalue) {
                var vertex = new mxCell(id, new mxGeometry(0, 0, 80, 30), 'whiteSpace=wrap;html=1;');
                vertex.id = id;
                vertex.value = cellvalue;
                vertex.vertex = true;
                vertices[id] = vertex;
                cells.push(vertex);
                return vertex;
            }

            function clearLineText(stackLine) {
                if (stackLine.includes('('))
                    stackLine = stackLine.substring(0, stackLine.indexOf('('));
                return stackLine.trim();
            }

            for (var i = lines.length - 1; i >= 0; i--) {
                lines[i] = clearLineText(lines[i]);
                if (lines[i].length != 0 && lines[i].charAt(0) != ';') {
                    var source = vertices[lastItem];
                    var target = createVertex(i, lines[i]);
                    if (source != null) {
                        var edge = new mxCell('', new mxGeometry());
                        edge.edge = true;
                        source.insertEdge(edge, true);
                        target.insertEdge(edge, false);
                        cells.push(edge);

                        // Recursive call. Change style
                        if (target.value == source.value)
                            target.style = 'whiteSpace=wrap;html=1;strokeColor=#d6b656;fillColor=#fff2cc'
                    }
                    lastItem = i;
                }
            }

            if (cells.length > 0) {
                var container = document.createElement('div');
                container.style.visibility = 'hidden';
                document.body.appendChild(container);

                // Temporary graph for running the layout
                var graph = new Graph(container);

                graph.getModel().beginUpdate();
                try {
                    cells = graph.importCells(cells);

                    for (var i = 0; i < cells.length; i++) {
                        if (graph.getModel().isVertex(cells[i])) {
                            var size = graph.getPreferredSizeForCell(cells[i]);
                            cells[i].geometry.width = Math.max(cells[i].geometry.width, size.width);
                            cells[i].geometry.height = Math.max(cells[i].geometry.height, size.height);
                        }
                    }

                    var layout = new mxCompactTreeLayout(graph);
                    layout.edgeRouting = false;
                    layout.horizontal = false;
                    layout.levelDistance = 20;
                    layout.execute(graph.getDefaultParent());

                    var edgeLayout = new mxParallelEdgeLayout(graph);
                    edgeLayout.spacing = 20;
                    edgeLayout.execute(graph.getDefaultParent());
                }
                finally {
                    graph.getModel().endUpdate();
                }

                graph.clearCellOverlays();

                // Copy to actual graph
                var inserted = [];

                editorUi.editor.graph.getModel().beginUpdate();
                try {
                    inserted = editorUi.editor.graph.importCells(graph.getModel().getChildren(
                        graph.getDefaultParent()), insertPoint.x, insertPoint.y)
                    editorUi.editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', inserted));
                }
                finally {
                    editorUi.editor.graph.getModel().endUpdate();
                }

                editorUi.editor.graph.setSelectionCells(inserted);
                editorUi.editor.graph.scrollCellToVisible(editorUi.editor.graph.getSelectionCell());
                graph.destroy();
                container.parentNode.removeChild(container);
            }
        };

        var div = document.createElement('div');
        div.style.textAlign = 'right';

        var textarea = document.createElement('textarea');
        textarea.style.resize = 'none';
        textarea.style.width = '100%';
        textarea.style.whiteSpace = 'nowrap';
        textarea.style.height = '454px';
        textarea.style.marginBottom = '16px';

        function getDefaultValue() {
            return '//Paste you Pascal class text in here\n//You can also drag and drop a file';
        };

        var defaultValue = getDefaultValue();
        textarea.value = defaultValue;
        div.appendChild(textarea);

        this.init = function () {
            textarea.focus();
            textarea.select();
        };

        // Enables dropping files
        if (Graph.fileSupport) {
            function handleDrop(evt) {
                evt.stopPropagation();
                evt.preventDefault();

                if (evt.dataTransfer.files.length > 0) {
                    var file = evt.dataTransfer.files[0];

                    var reader = new FileReader();
                    reader.onload = function (e) { textarea.value = e.target.result; };
                    reader.readAsText(file);
                }
            };

            function handleDragOver(evt) {
                evt.stopPropagation();
                evt.preventDefault();
            };

            // Setup the dnd listeners.
            textarea.addEventListener('dragover', handleDragOver, false);
            textarea.addEventListener('drop', handleDrop, false);
        }

        var cancelBtn = mxUtils.button(mxResources.get('close'), function () {
            if (textarea.value == defaultValue) {
                editorUi.hideDialog();
            }
            else {
                editorUi.confirm(mxResources.get('areYouSure'), function () {
                    editorUi.hideDialog();
                });
            }
        });

        cancelBtn.className = 'geBtn';

        if (editorUi.editor.cancelFirst) {
            div.appendChild(cancelBtn);
        }

        var parseTextBtn = mxUtils.button(mxResources.get('insert') + ' as UML Class', function () {
            editorUi.hideDialog();
            try {
                parseAsUMLClass(textarea.value);
            }
            catch (error) {
                alert('Failed to parse the text to UML Class!\n' + error);
            }
        });
        div.appendChild(parseTextBtn);
        parseTextBtn.className = 'geBtn gePrimaryBtn';

        var parseActivityBtn = mxUtils.button(mxResources.get('insert') + ' as Activity', function () {
            editorUi.hideDialog();
            try {
                parseAsActivity(textarea.value);
            }
            catch (error) {
                alert('Failed to parse the text to activity diagram!\n' + error);
            }
        });
        div.appendChild(parseActivityBtn);
        parseActivityBtn.className = 'geBtn gePrimaryBtn';

        if (!editorUi.editor.cancelFirst) {
            div.appendChild(cancelBtn);
        }

        this.container = div;
    };

    // Adds resource for action
    mxResources.parse('parsePascalToUMLAction=Transform from Pascal to UML');
    mxResources.parse('parsePascalToUMLAbout=About');

    // Adds action
    ui.actions.addAction('parsePascalToUMLAction', function () {
        var dlg = new ParseDialog(ui, 'Insert from Text');
        ui.showDialog(dlg.container, 680, 520, true, false);
        dlg.init();
    });

    ui.actions.addAction('parsePascalToUMLAbout', function () {
        alert('dev by Iuri Farenzena\nbeta version 2021.01.21.1');
    });

    // Adds menu
    ui.menubar.addMenu('Pascal', function (menu) {
        ui.menus.addMenuItem(menu, 'parsePascalToUMLAction');
        ui.menus.addMenuItem(menu, 'parsePascalToUMLAbout');
    });

    // Reorders menubar
    ui.menubar.container.insertBefore(ui.menubar.container.lastChild,
        ui.menubar.container.lastChild.previousSibling.previousSibling);

    // Adds toolbar button
    ui.toolbar.addSeparator();
    var elt = ui.toolbar.addItem('', 'parsePascalToUMLAction');

    // Cannot use built-in sprites
    elt.firstChild.style.backgroundImage = 'url(\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAMAAABl5a5YAAAB0VBMVEUAAADnJzrnJjntWmnnKDvnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnKTznJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJjrnKz7pOEnnJzrnJzrnJzrnJzrnJzrnKj3rSVnnJzrnJzrnJzrnJzrnJTjrSFjnJzrnJzrnJzrnJzrnJzrnKTztXGvnJzrnJzrnJzrnJzrnJzrnJzroLkDnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnJzrnKj3uZ3TnJjrnJzrnJzrnJzrnJzrnJzrnJDftYG7nJzrnJzrnJzrnJjnpO0zrTVznJjnnJzrnJzrnJzrmHTHpOUrrTl3oM0XnJzrnJzrnJzrmIjXqRVXnJzrnJzrnJzrnKDvnKj3nJjnnJzrnJzrnJzrnJTnnJzroLD/pNUfrR1fnJjnoMEPuYnDnKz3oMUPsU2LnJTjpNkjnKDsF4M2sAAAAjnRSTlMAAAAAABY4RCQCAwYtnPDsVWqiSQkUl+dg27ZW9mwR+Xbybcv9pSCYi9aK46D1gw1F+K/Frq/TyMG9YgEFTOa4qPBvIyuzlrX6zMkoyqTh5doZPZ6f/M3E8+0xO7S70uvVsIZYEg51oP74qXw8BHqd7vGOL6uy+ObZtSIgmM3RwK0PEcW3/l8qjo6duoECdJEa5QAAAQxJREFUGNNjYGBgBAFWNnYOTi4gA8znZufh5eMXEBQSFmEE8UXFxCUk+6Sk+ftkZEECcgLy4gryikrKfSqqakABEXUNPk0tbR3ePl09faAZjAaGRsYmpmbmFpZW1iBDbWzt7B0c+/v6+vidnDmBlri4url7TADyDT29jICWMHj7+PpNnNTX528Z0BcQCBQICg4JndwnHxYe0dcXGQUUiPaJmTLVMDYuPiExKTkFKJCalp4xLTMrO0fUhhHs8ty8/ILpMwpNilIgfAbG4pLSsnL/2IrKKjCfgZHbubqmtq6+oS+xEaKCkbGpeeasvhbJ1jaoEsb2js6ubquevmBriABTLzMLo4h1cbgwSAUALik/ZK7K7xoAAAAASUVORK5CYII=\')';
    elt.firstChild.style.backgroundPosition = '2px 3px';
});