import "./App.css";
import React, { useRef, useEffect } from "react";

import rectangleGif from "./images/rectangle.gif";
import ellipseGif from "./Ellipse.png";

import {ReactComponent as SVG} from './static/media/test.svg'

const mxgraph = require("mxgraph")({
  mxBasePath: "./src",
});

window['mxClient'] = mxgraph.mxClient
window['mxGraph'] = mxgraph.mxGraph
window['mxGeometry'] = mxgraph.mxGeometry

const data=null

console.log(mxgraph);

function App() {
  const editor = useRef(null);
  const toolbarRef = useRef(null);

  function addToolbarItem(graph, toolbar, prototype, image) {
    // Function that is executed when the image is dropped on
    // the graph. The cell argument points to the cell under
    // the mousepointer if there is one.
    const funct = function (graph, evt, cell) {
      graph.stopEditing(false);

      const pt = graph.getPointForEvent(evt);
      const vertex = graph.getModel().cloneCell(prototype);
      vertex.geometry.x = pt.x;
      vertex.geometry.y = pt.y;

      graph.setSelectionCells(graph.importCells([vertex], 0, 0, cell));
    };

    // Creates the image which is used as the drag icon (preview)
    const img = toolbar.addMode("", image, funct);
    mxgraph.mxUtils.makeDraggable(img, graph, funct);
  }

  useEffect(() => {
    if (editor && toolbarRef) {

      mxgraph.mxEvent.disableContextMenu(editor.current);
      const model = new mxgraph.mxGraphModel();
      const graph = new mxgraph.mxGraph(editor.current, model);
      graph.dropEnabled = true;

      editor.current = graph.container;

        // Disables floating connections (only connections via ports allowed)
        graph.connectionHandler.isConnectableCell = function (cell) {
          return false;
        };
        mxgraph.mxEdgeHandler.prototype.isConnectableCell = function (cell) {
          return graph.connectionHandler.isConnectableCell(cell);
        };

        // Disables existing port functionality
        graph.view.getTerminalPort = function (state, terminal, source) {
          return terminal;
        };

        // Sets the port for the given connection
        graph.setConnectionConstraint = function (
          edge,
          terminal,
          source,
          constraint
        ) {
          if (constraint != null) {
            const key = source
              ? mxgraph.mxConstants.STYLE_SOURCE_PORT
              : mxgraph.mxConstants.STYLE_TARGET_PORT;

            if (constraint == null || constraint.id == null) {
              this.setCellStyles(key, null, [edge]);
            } else if (constraint.id != null) {
              console.log('edge', edge)
              this.setCellStyles(key, constraint.id, [edge]);
            }
          }
        };

        graph.addListener(mxgraph.mxEvent.CLICK, function (sender, evt) {
          const cell = evt.getProperty('cell');
          console.log('cell', cell);
        });

      // if (graph.connectionHandler.connectImage == null)
      // {
      //   graph.connectionHandler.isConnectableCell = function(cell)
      //   {
      //      return false;
      //   };
      //   mxgraph.mxEdgeHandler.prototype.isConnectableCell = function(cell)
      //   {
      //     return graph.connectionHandler.isConnectableCell(cell);
      //   };
      // }
      
      graph.getAllConnectionConstraints = function(terminal)
      {
        if (terminal != null && this.model.isVertex(terminal.cell))
        {
          return [new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(0, 0), true),
              new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(0.5, 0), true),
              new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(1, 0), true),
              new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(0, 0.5), true),
            new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(1, 0.5), true),
            new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(0, 1), true),
            new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(0.5, 1), true),
            new mxgraph.mxConnectionConstraint(new mxgraph.mxPoint(1, 1), true)];
        }

        return null;
      };

      const toolbar = new mxgraph.mxToolbar(toolbarRef.current);
      toolbar.enabled = false;

      // Enables connect preview for the default edge style
      graph.connectionHandler.createEdgeState = function () {
        const edge = graph.createEdge(null, null, null, null, null, 'edgeStyle=orthogonalEdgeStyle');

        return new mxgraph.mxCellState(
          this.graph.view,
          edge,
          this.graph.getCellStyle(edge)
        );
      };

      const button = mxgraph.mxUtils.button("Save", function (evt) {
        console.log(evt);
        const encoder = new mxgraph.mxCodec();
        const result = encoder.encode(graph.model);
        const xml = mxgraph.mxUtils.getXml(result);
        console.log("xml", xml);
      });

      button.style.position = "relative";
      button.style.left = "2px";
      button.style.top = "2px";

      document.body.appendChild(button);

      const style = graph.stylesheet.getDefaultEdgeStyle();
      style[mxgraph.mxConstants.STYLE_ROUNDED] = true;
      style[mxgraph.mxConstants.STYLE_EDGE] =
        mxgraph.mxEdgeStyle.ElbowConnector;

      style[mxgraph.mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white'
      style[mxgraph.mxConstants.STYLE_OVERFLOW] = 'hidden'
      style[mxgraph.mxConstants.STYLE_LABEL_POSITION] = 'right'

      console.log("style", style);

      console.log("graph", graph);

      console.log("model", model);

      graph.edgeLabelsMovable = false;

      graph.setConnectable(true);
      graph.setMultigraph(false);


      if (data) {
        graph.getModel().beginUpdate();
        try {
          var doc = mxgraph.mxUtils.parseXml(data);

          console.log(doc);

          var codec = new mxgraph.mxCodec(doc);
          var elt = doc.documentElement.firstChild;

          console.log("elttt", elt.firstChild);

          var cells = [];

          var eltChildren = elt.firstChild;

          console.log("elt", eltChildren.nextSibling);

          while (eltChildren != null) {
            cells.push(codec.decodeCell(eltChildren));
            eltChildren = eltChildren.nextSibling;
          }

          graph.addCells(cells);
        } finally {
          graph.getModel().endUpdate();
        }
      }

      // Stops editing on enter or escape keypress
      const keyHandler = new mxgraph.mxKeyHandler(graph);
      const rubberBand = new mxgraph.mxRubberband(graph)

      console.log("graph", graph);

      const img = new mxgraph.mxImage('./static/media/test.svg')


      console.log(img)

      keyHandler.bindKey(46, function () {
        if (graph.isEnabled()) {
          graph.removeCells();
        }
      });

      const addVertex = function (icon, w, h, style) {
        const vertex = new mxgraph.mxCell(
          null,
          new mxgraph.mxGeometry(0, 0, w, h),
          style
        );
        vertex.setVertex(true);

        addToolbarItem(graph, toolbar, vertex, icon);
      };

      addVertex(rectangleGif, 100, 60, "");
      addVertex(ellipseGif, 80, 80, "shape=ellipse;perimeter=ellipsePerimeter");
      toolbar.addLine();

      
    }
  }, [editor, toolbarRef]);

  console.log("editor", editor);

  return (
    <React.Fragment>
      <div className="App">
        <div ref={toolbarRef} id="toolbar" className="tbar"><SVG/></div>
        <div ref={editor} id="abc" className="grid"></div>
        {/* <img src="./static/media/test.svg" alt="abs"></img> */}
      </div>
    </React.Fragment>
  );
}

export default App;
