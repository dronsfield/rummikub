import "./index.css"
import interact from "interactjs"
import React from "react"
import ReactDOM from "react-dom"
import useDimensions from "./useDimensions"
import { eventNames } from "process"

const SVG_NS = "http://www.w3.org/2000/svg"

function setAttrs(
  el: HTMLElement | SVGGraphicsElement | SVGRectElement,
  attrs: { [name: string]: any }
) {
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value))
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

  const getRectProps = React.useCallback(
    (id: string, data: TileState) => {
      return {
        id,
        className: "tile",
        width: tileDims.width,
        height: tileDims.height,
        fill: tileColor,
        x: 0.5 * (svgDimensions?.width || 0) + (data.x - 0.5) * tileDims.width,
        y: 0.5 * (svgDimensions?.height || 0) + (data.y - 0.5) * tileDims.height
      }
    },
    [svgDimensions]
  )

  const getCoordsFromPosition = React.useCallback(
    (x: number, y: number) => {
      if (!svgDimensions) return { x: 0, y: 0 }
      return {
        x: Math.floor((-0.5 * svgDimensions.width + x) / tileDims.width + 0.5),
        y: Math.floor((-0.5 * svgDimensions.height + y) / tileDims.height + 0.5)
      }
    },
    [svgDimensions]
  )

  React.useMemo(() => {
    const getRectCentreFromDragEvent = (event: any) => {
      return {
        x: event.rect?.left + 0.5 * event.rect?.width,
        y: event.rect?.top + 0.5 * event.rect?.height
      }
    }
    const setShadowAttrs = (event: any) => {
      // const rectCentre = getRectCentreFromDragEvent(event)
      const coords = getCoordsFromPosition(event.page.x, event.page.y)
      console.log(`(${coords.x}, ${coords.y})`)
      const rectProps = getRectProps("shadow", {
        location: "DRAG_SHADOW",
        x: coords.x,
        y: coords.y
      })
      setAttrs(document.getElementById("shadow") as any, {
        ...rectProps,
        className: "",
        fill: "#ddd"
      })
    }
    interact(".tile").draggable({
      listeners: {
        start: (event) => {
          console.log("START", { event })
        },
        move: (event) => {
          setShadowAttrs(event)
          analyseEvent(event)
          setAttrs(event.target, {
            transform: `translate(${event.page.x - event.x0}, ${
              event.page.y - event.y0
            })`
          })
        },
        end: (event) => {
          console.log("END", { event })
          setAttrs(event.target, { transform: "" })
          // const rectCentre = getRectCentreFromDragEvent(event)
          const coords = getCoordsFromPosition(event.page.x, event.page.y)
          updateState({
            [event.target.id]: { location: "TABLE", ...coords }
          })
        }
      }
    })
  }, [getCoordsFromPosition, getRectProps, updateState])

  const renderGrid = () => {
    return new Array(20).fill(0).map((_, index) => {
      const x =
        (index - 10.5) * tileDims.width + 0.5 * (svgDimensions?.width || 0)
      const y =
        (index - 10.5) * tileDims.height + 0.5 * (svgDimensions?.height || 0)
      return (
        <>
          <line
            x1={x}
            x2={x}
            y1={0}
            y2={svgDimensions?.height}
            stroke="black"
          />
          <text x={x} y={20} fill="red" children={x} />
          <line x1={0} x2={svgDimensions?.width} y1={y} y2={y} stroke="black" />
        </>
      )
    })
  }

  return (
    <>
      <pre id="anapre" style={{ position: "fixed", top: 0, right: 0 }} />
      <svg id="the-svg" ref={svgRef}>
        {renderGrid()}
        <rect id="shadow" />
        {Object.entries(state).map(([id, data]) => {
          return <rect key={id} {...getRectProps(id, data)} />
        })}
      </svg>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
