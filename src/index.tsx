import "./index.css"
import interact from "interactjs"

const SVG_NS = "http://www.w3.org/2000/svg"

function setAttrs(
  el: HTMLElement | SVGGraphicsElement | SVGRectElement,
  attrs: { [name: string]: string }
) {
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value)
  })
}

const svg = document.createElementNS(SVG_NS, "svg")
svg.id = "the-svg"
document.body.appendChild(svg)

const tile = document.createElementNS(SVG_NS, "rect")
setAttrs(tile, {
  class: "tile",
  height: "100",
  width: "70",
  fill: "red"
})
svg.appendChild(tile)

interact(".tile").draggable({
  listeners: {
    start: (event) => {
      console.log("START", { event })
    },
    move: (event) => {
      console.log("MOVE", { event })
      setAttrs(event.target, {
        transform: `translate(${event.page.x - event.x0}, ${
          event.page.y - event.y0
        })`
      })
    }
  }
})
