
export default class AboutDialog {
    constructor(ui) {

        var div = document.createElement('div');
        div.style.position = 'relative';
        div.style.height = '100%'

        var contentDiv = document.createElement('div');

        var headerPara = mxUtils.para(contentDiv, 'Delphi Parser plugin');
        headerPara.style.fontWeight = 'bold';
        headerPara.style.fontSize = 'x-large';

        mxUtils.para(contentDiv, '').innerHTML = 'Delphi Parser plugin for Draw.io by <b>Iuri Farenzena</b>';
        mxUtils.para(contentDiv, 'https://github.com/iurifarenzena/drawio_delphiParser_plugin').style.fontSize = 'x-small';
        mxUtils.para(contentDiv, 'Version 2022.1.7.12').style.fontSize = 'x-small';

        div.appendChild(contentDiv);

        var okBtn = mxUtils.button(mxUtils.closeResource, function () {
            ui.hideDialog();
        });
        div.appendChild(okBtn);
        okBtn.className = 'geBtn gePrimaryBtn';
        okBtn.style.position = 'absolute';
        okBtn.style.bottom = '0';
        okBtn.style.right = '0';

        this.container = div;
    }
}
