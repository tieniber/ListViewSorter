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

    "dojo/text!ListSorter/widget/template/ListSorter.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, on, dojoQuery, widgetTemplate) {
    "use strict";

    return declare("ListSorter.widget.ListSorter", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,


        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _currentSortDirection: null,

        //modeler variables,
        sortAttribute: "",
        listEntity: "",
        targetListName: "",
		headerLabel: "",
		headerClass: "",

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            on(this.listSortDiv, "click", dojoLang.hitch(this, this._doClick));
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
            dojoClass.add(this.listSortDiv, "sort-header");
			dojoClass.add(this.headerLabelSpan, this.headerClass);
            this._setSort(this.sortSpan, this._currentSortDirection);
			this.headerLabelSpan.innerHTML = this.headerLabel;

            mendix.lang.nullExec(callback);
        },
        _toggleDirection: function(){
          this._currentSortDirection
            ? this._currentSortDirection == "asc"
              ? this._currentSortDirection = "desc"
              : this._currentSortDirection = "asc"
            : this._currentSortDirection = "asc";
        },
        _doClick: function(e) {
            // e.preventDefault();
            this._toggleDirection();
            var listNode = dojoQuery(".mx-name-" + this.targetListName)[0];
            if (listNode) {
                var listWidget = dijit.registry.byNode(listNode);
                if (listWidget) {
					var datasourceRef = listWidget._datasource || listWidget._dataSource;

					listWidget.sort = [[this.sortAttribute, this._currentSortDirection]];
                    datasourceRef._sorting = [[this.sortAttribute, this._currentSortDirection]]; //Fix for Mx5.19, not needed in 6.10 (or so it seems)
                    if (listWidget.update) {
						listWidget.update();
					} else {
						listWidget.reload();
					}
                    this._updateRendering();
                    this._resetOtherWidgetsRendering();
                } else {
                    console.log("Found a list view node but not the widget.");
                }
            } else {
                console.log("Could not find the list view node.");
            }
        },
        _resetOtherWidgetsRendering: function(){
          var others = document.querySelectorAll('.listSorter .sortIcon:not(.sort-none)');
          var self = this;
          others.forEach(function(el){
            if (el === self.sortSpan) return;
            self._setSort(el, null);
          });
        },
        _setSort: function(el, dir){
          if (dir === "asc"){
            dojoClass.add(el, "sort-asc");
            dojoClass.remove(el, "sort-desc");
            dojoClass.remove(el, "sort-none");
          }
          else if (dir === "desc"){
            dojoClass.remove(el, "sort-asc");
            dojoClass.add(el, "sort-desc");
            dojoClass.remove(el, "sort-none");
          }
          else {
            dojoClass.remove(el, "sort-asc");
            dojoClass.remove(el, "sort-desc");
            dojoClass.add(el, "sort-none");
          }
        }
    });
});

require(["ListSorter/widget/ListSorter"]);
