import parseDelphiUnitToUml from "./delphiParserToUml";
import { parseCallstackToActivityDiagram }  from "./delphiParserToActivity"

export default class ParseDialog {
    constructor(ui) {

        function parseAsUMLClass(text) {
            parseDelphiUnitToUml(text, ui);
        }

        function parseAsActivity(text) {
            parseCallstackToActivityDiagram(text, ui);
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
                ui.hideDialog();
            }
            else {
                ui.confirm(mxResources.get('areYouSure'), function () {
                    ui.hideDialog();
                });
            }
        });

        cancelBtn.className = 'geBtn';

        if (ui.editor.cancelFirst) {
            div.appendChild(cancelBtn);
        }

        var parseTextBtn = mxUtils.button(mxResources.get('insert') + ' as UML Class', function () {
            ui.hideDialog();
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
            ui.hideDialog();
            try {
                parseAsActivity(textarea.value);
            }
            catch (error) {
                alert('Failed to parse the text to activity diagram!\n' + error);
            }
        });
        div.appendChild(parseActivityBtn);
        parseActivityBtn.className = 'geBtn gePrimaryBtn';

        if (!ui.editor.cancelFirst) {
            div.appendChild(cancelBtn);
        }

        this.container = div;
    }
}
