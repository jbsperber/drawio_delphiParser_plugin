import AboutDialog from "./aboutDialog";
import ParseDialog from "./delphiParserDialog";

/**
 * Parses Pascal classes to a UML Class into draw.io's canvas
 */
Draw.loadPlugin(function (ui) {
    
    // Adds resource for action
    mxResources.parse('parsePascalToUMLAction=Transform from Pascal to UML');
    mxResources.parse('parsePascalToUMLAbout=About');

    // Adds action
    ui.actions.addAction('parsePascalToUMLAction', function () {
        var dlg = new ParseDialog(ui);
        ui.showDialog(dlg.container, 680, 520, true, false);
        dlg.init();
    });

    ui.actions.addAction('parsePascalToUMLAbout', function () {
        ui.showDialog(new AboutDialog(ui).container, 320, 200, true, true);
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