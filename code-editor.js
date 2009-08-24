(function() {
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        Lang = YAHOO.lang
        ;
    
    YAHOO.widget.CodeEditor = function (id, cfg) {
        // Disable Editor configs that don't apply
        cfg["animate"] = false;
        cfg["dompath"] = false;

        YAHOO.widget.CodeEditor.superclass.constructor.call(this, id, cfg);

        this.on('editorContentLoaded', function() {
            var link = this._getDoc().createElement('link');
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "code.css";
            this._getDoc().getElementsByTagName('head')[0].appendChild(link);
            this.highlight(true);
            if (this.browser.ie) {
                this._getDoc().body.style.marginLeft = '';
            }
        }, this, true);
        this.on('editorKeyPress', function(ev) {
            Lang.later(100, this, this.highlight);
        }, this, true);
        
        //Borrowed this from CodePress: http://codepress.sourceforge.net
        this.cc = '\u2009'; // carret char
        this.keywords = [
            { code: /(&lt;DOCTYPE.*?--&gt.)/g, tag: '<ins>$1</ins>' }, // comments
            { code: /(&lt;[^!]*?&gt;)/g, tag: '<b>$1</b>'	}, // all tags
            { code: /(&lt;!--.*?--&gt.)/g, tag: '<ins>$1</ins>' }, // comments
            { code: /\b(YAHOO|widget|util|Dom|Event|lang)\b/g, tag: '<cite>$1</cite>' }, // reserved words
            { code: /\b(break|continue|do|for|new|this|void|case|default|else|function|return|typeof|while|if|label|switch|var|with|catch|boolean|int|try|false|throws|null|true|goto)\b/g, tag: '<b>$1</b>' }, // reserved words
            { code: /\"(.*?)(\"|<br>|<\/P>)/g, tag: '<s>"$1$2</s>' }, // strings double quote
            { code: /\'(.*?)(\'|<br>|<\/P>)/g, tag: '<s>\'$1$2</s>' }, // strings single quote
            { code: /\b(alert|isNaN|parent|Array|parseFloat|parseInt|blur|clearTimeout|prompt|prototype|close|confirm|length|Date|location|Math|document|element|name|self|elements|setTimeout|navigator|status|String|escape|Number|submit|eval|Object|event|onblur|focus|onerror|onfocus|onclick|top|onload|toString|onunload|unescape|open|valueOf|window|onmouseover|innerHTML)\b/g, tag: '<u>$1</u>' }, // special words
            { code: /([^:]|^)\/\/(.*?)(<br|<\/P)/g, tag: '$1<i>//$2</i>$3' }, // comments //
            { code: /\/\*(.*?)\*\//g, tag: '<i>/*$1* /</i>' } // comments / * */
        ];
        //End Borrowed Content
    };
    Lang.extend( YAHOO.widget.CodeEditor, YAHOO.widget.Editor );
    


    YAHOO.widget.CodeEditor.prototype._cleanIncomingHTML = function(str) {
        return str;
    };
    
    YAHOO.widget.CodeEditor.prototype.focusCaret = function() {
        if (this.browser.gecko) {
            if (this._getWindow().find(this.cc)) {
                this._getSelection().getRangeAt(0).deleteContents();
            }
        } else if (this.browser.opera) {
            var sel = this._getWindow().getSelection();
            var range = this._getDoc().createRange();
            var span = this._getDoc().getElementsByTagName('span')[0];
                
            range.selectNode(span);
            sel.removeAllRanges();
            sel.addRange(range);
            span.parentNode.removeChild(span);
        } else if (this.browser.webkit || this.browser.ie) {
            this.focus();
            var cur = this._getDoc().getElementById('cur');
            cur.id = '';
            cur.innerHTML = '';
            this._selectNode(cur);
        }
    };
    YAHOO.widget.CodeEditor.prototype.highlight = function(focus) {
        if (!focus) {
            if (this.browser.gecko) {
                this._getSelection().getRangeAt(0).insertNode(this._getDoc().createTextNode(this.cc));
            } else if (this.browser.opera) {
			    var span = this._getDoc().createElement('span');
			    this._getWindow().getSelection().getRangeAt(0).insertNode(span);
            } else if (this.browser.webkit || this.browser.ie) {
                this.execCommand('inserthtml', '<span id="cur"></span>');
            }
        }
        var html = '';
        html = this._getDoc().body.innerHTML;
        if (this.browser.opera) {
		    html = html.replace(/<(?!span|\/span|br).*?>/gi,'');
        } else if (this.browser.webkit) {
            //YAHOO.log('1: ' + html);
            html = html.replace(/<span id="cur"><\/span>/ig, '!!CURSOR_HERE!!');
            html = html.replace(/<\/div>/ig, '');
            html = html.replace(/<br><div>/ig, '<br>');
            html = html.replace(/<div>/ig, '<br>');
            html = html.replace(/<br>/ig,'\n');
            html = html.replace(/<.*?>/g,'');
            html = html.replace(/\n/g,'<br>');
            //YAHOO.log('2: ' + html);
        } else {
            if (this.browser.ie) {
                html = html.replace(/<SPAN id=cur><\/SPAN>/ig, '!!CURSOR_HERE!!');
                html = html.replace(/<SPAN id=""><\/SPAN>/ig, '');
            }
            YAHOO.log(html);
            html = html.replace(/<br>/gi,'\n');
            html = html.replace(/<.*?>/g,'');
            html = html.replace(/\n/g,'<br>');
            YAHOO.log(html);
        }
        for (var i = 0; i < this.keywords.length; i++) {
            html = html.replace(this.keywords[i].code, this.keywords[i].tag);
        }

        html = html.replace('!!CURSOR_HERE!!', '<span id="cur">&nbsp;|&nbsp;</span>');

        this._getDoc().body.innerHTML = html;
        if (!focus) {
            this.focusCaret();
        }
    };
})();
