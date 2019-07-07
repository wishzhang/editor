import {Parser} from "./parser";
import '../static/kindeditor/kindeditor-all-min';
import '../static/kindeditor/lang/zh-CN';

KindEditor.ready(function (K) {
    var options = {
        basePath:'./static/kindeditor/'
    };
    window.editor = K.create('#editor_id', options);

    window.test = function () {
        var text = editor.text();

        var parser=new Parser({
            text:text
        });

        console.dir(parser.getResult());
    };
});