define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
	"mxui/mixin/_Stateful",
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
], function(declare, _WidgetBase, _TemplatedMixin, _StatefulMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, on, dojoQuery, widgetTemplate) {
    "use strict";

    return declare("ListSorter.widget.ListSorter", [_WidgetBase, _TemplatedMixin, _StatefulMixin], {

        templateString: widgetTemplate,
        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _currentSortDirection: "",
        _previousSortDirection: "",
		_secondarySortArray: null,

        //modeler variables,
        sortAttribute: "",
        listEntity: "",
        targetListName: "",
		headerLabel: "",
		headerClass: "",
		defaultSort: "",

		sortEntityPath: "",
		sortAttributePath: "",

		//an array of other active sorting widgets
		_sortingWidgets: {},
		_disableDefaultSort:{},

        constructor: function() {
            this._handles = [];
			this._secondarySortArray = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");

			if(this._sortingWidgets[this.mxform.hash]) {
				this._sortingWidgets[this.mxform.hash].push(this);
			} else {
				this._sortingWidgets[this.mxform.hash] = [this];
			}

            on(this.listSortDiv, "click", dojoLang.hitch(this, this._doClick));

			//set up secondary sort string
			if (this.secSortAttribute) {
				this._secondarySortArray = [this.secSortAttribute, this.secSortOrder];
			} else if (this.secSortEntityPath) {
				this._secondarySortArray = [this.secSortEntityPath+"/"+this.secSortAttributePath, this.secSortOrder];
			} else if (this.secRefsetPath) {
				this._secondarySortArray = [this.secRefsetPath+"/"+this.secSortAttributePath2, this.secSortOrder];
			}

			//retrieve state (if available)
			this._previousSortDirection = this.getState("sortDirection", "");
			if (this._previousSortDirection !== "") {
				this._currentSortDirection = this._previousSortDirection;
				this.defaultSort = "no";
				this._disableDefaultSort[this.mxform.hash] = true;
				//this._disableDefaultSort = {disable:true};
				this._setSort(this.sortSpan, this._currentSortDirection);
			}
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;

			//set default sort
			if(!this._disableDefaultSort[this.mxform.hash]) {
				if(this.defaultSort === "asc") {
					this._doClick();
				} else if (this.defaultSort === "desc") {
					this._toggleDirection();
					this._doClick();
				}
			}
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },
		storeState: function(t) {
			t("sortDirection", this._currentSortDirection);
		},

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");
            dojoClass.add(this.listSortDiv, "sort-header");
			dojoClass.add(this.headerLabelSpan, this.headerClass);
            this._setSort(this.sortSpan, this._currentSortDirection);
			this.headerLabelSpan.innerHTML = this.headerLabel;

            if(callback) {
				callback();
			}
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

					//primary sorting
					var tempSortArray = [];
					if (this.sortAttribute) {
						tempSortArray = [[this.sortAttribute, this._currentSortDirection]];
					} else if (this.sortEntityPath) {
						tempSortArray = [[this.sortEntityPath+"/" +this.sortAttributePath, this._currentSortDirection]];
					} else if (this.refsetPath) {
						tempSortArray = [[this.refsetPath+"/" +this.sortAttributePath2, this._currentSortDirection]];
					}

					//secondary sorting
					if(this._secondarySortArray.length > 0) {
						tempSortArray.push(this._secondarySortArray);
					}

					listWidget.sort = tempSortArray;
					datasourceRef._sorting = tempSortArray;

					//upate the grid
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
		  var others = this._sortingWidgets[this.mxform.hash];

		  for(var i=0; i<others.length; i++) {
			  var other = others[i];
			  if (other === this) continue;
              other._setSort(other.sortSpan, "");
		  }
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
			this._currentSortDirection = "";
          }
        }
    });
});

require(["ListSorter/widget/ListSorter"]);
