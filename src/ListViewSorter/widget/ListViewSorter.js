define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/on",
    "dojo/query",

    "dojo/text!ListViewSorter/widget/template/ListViewSorter.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, on, dojoQuery, widgetTemplate) {
    "use strict";

    return declare("ListViewSorter.widget.ListViewSorter", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,


        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _currentSortDirection: null,

        //modeler variables,
        sortAttribute: "",
        listViewEntity: "",
        targetListViewName: "",

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            on(this.listViewSortButton, "click", dojoLang.hitch(this, this._doClick));

        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;

            //find the list view

            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            mendix.lang.nullExec(callback);
        },

        _doClick: function(e) {
            // e.preventDefault();
            var lvNode = dojoQuery(".mx-name-" + this.targetListViewName)[0];
            if (lvNode) {
                var lvWidget = dijit.registry.byNode(lvNode);
                if (lvWidget) {
                    lvWidget.sort = [[this.sortAttribute, "asc"]];
                    lvWidget._datasource._sorting = [[this.sortAttribute, "asc"]]; //Fix for Mx5.19, not needed in 6.10 (or so it seems)
                    lvWidget.update();
                } else {
                    console.log("Found a list view node but not the widget.");
                }
            } else {
                console.log("Could not find the list view node.");
            }
        }
    });
});

require(["ListViewSorter/widget/ListViewSorter"]);
