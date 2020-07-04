import "./index.css"
import interact from "interactjs"
import React from "react"
import ReactDOM from "react-dom"
import useDimensions from "./useDimensions"

// const SVG_NS = "http://www.w3.org/2000/svg"

function setAttrs(
  el: HTMLElement | SVGGraphicsElement | SVGRectElement,
  attrs: { [name: string]: string }
) {
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value)
  })
}

// const svg = document.createElementNS(SVG_NS, "svg")
// svg.id = "the-svg"
// document.body.appendChild(svg)

// const tile = document.createElementNS(SVG_NS, "rect")
// setAttrs(tile, {
//   class: "tile",
//   height: "100",
//   width: "70",
//   fill: "red",
//   x: "50%",
//   y: "50%"
// })
// svg.appendChild(tile)

interface TileState {
  location: string
  x: number
  y: number
}

type State = { [id: string]: TileState }

const State = {
  __state: {},
  update: (data: { [id: string]: TileState }) => {}
}

const defaultState: State = {
  A01: { location: "TABLE", x: 0, y: 0 },
  B02: { location: "TABLE", x: 1, y: 0 }
}

const tileDims = { width: 70, height: 100 }
const tileColor = "yellow"

function analyseEvent(event: any) {
  const pre = document.getElementById("anapre")

  const {
    client,
    clientXO,
    clientY0,
    delta,
    page,
    rect,
    x0,
    y0,
    clientX,
    clientY,
    pageX,
    pageY
  } = event

  if (pre)
    pre.innerHTML = JSON.stringify(
      {
        client,
        clientXO,
        clientY0,
        delta,
        page,
        rect,
        x0,
        y0,
        clientX,
        clientY,
        pageX,
        pageY
      },
      null,
      4
    )
}

const App = (props: any) => {
  const [svgRef, svgDimensions] = useDimensions()

  const [state, setState] = React.useState(defaultState)

  const updateState = React.useCallback((newState: State) => {
    setState((oldState) => ({ ...oldState, ...newState }))
  }, [])

  const renderTile = React.useCallback(
    (id: string, data: TileState) => {
      if (!svgDimensions) return null
      return (
        <rect
          id={id}
          className="tile"
          width={tileDims.width}
          height={tileDims.height}
          fill={tileColor}
          x={0.5 * svgDimensions.width + (data.x - 0.5) * tileDims.width}
          y={0.5 * svgDimensions.height + (data.y - 0.5) * tileDims.height}
        />
      )
    },
    [svgDimensions]
  )

  React.useMemo(() => {
    interact(".tile").draggable({
      listeners: {
        start: (event) => {
          console.log("START", { event })
        },
        move: (event) => {
          analyseEvent(event)
          // setAttrs(event.target, {
          //   transform: `translate(${event.page.x - event.x0}, ${
          //     event.page.y - event.y0
          //   })`
          // })
        },
        end: (event) => {
          console.log("END", { event })
          setAttrs(event.target, { transform: "" })
        }
      }
    })
  }, [])

  return (
    <>
      <pre id="anapre" style={{ position: "fixed", top: 0, right: 0 }} />
      <svg id="the-svg" ref={svgRef}>
        {Object.entries(state).map(([id, data]) => {
          return renderTile(id, data)
        })}
      </svg>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
