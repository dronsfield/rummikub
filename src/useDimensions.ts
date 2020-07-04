// https://github.com/Swizec/useDimensions/blob/master/src/index.ts

import { useState, useCallback, useLayoutEffect } from "react"

type SomeElement = HTMLElement | SVGGraphicsElement

export interface DimensionObject {
  width: number
  height: number
  top: number
  left: number
  x: number
  y: number
  right: number
  bottom: number
}

export type UseDimensionsHook = [
  (node: SomeElement | null) => void,
  DimensionObject | undefined,
  SomeElement | null
]

export interface UseDimensionsArgs {
  liveMeasure?: boolean
}

function getDimensionObject(node: SomeElement): DimensionObject {
  const rect = node.getBoundingClientRect()
  return rect
  // return {
  //   width: rect.width,
  //   height: rect.height,
  //   top: "x" in rect ? rect.x : rect.top,
  //   left: "y" in rect ? rect.y : rect.left,
  //   x: "x" in rect ? rect.x : rect.left,
  //   y: "y" in rect ? rect.y : rect.top,
  //   right: rect.right,
  //   bottom: rect.bottom
  // }
}

function useDimensions({
  liveMeasure = true
}: UseDimensionsArgs = {}): UseDimensionsHook {
  const [dimensions, setDimensions] = useState()
  const [node, setNode] = useState<SomeElement | null>(null)

  const ref = useCallback((node) => {
    setNode(node)
  }, [])

  useLayoutEffect(() => {
    if (node) {
      const measure = () =>
        window.requestAnimationFrame(() =>
          setDimensions(getDimensionObject(node))
        )
      measure()

      if (liveMeasure) {
        window.addEventListener("resize", measure)
        window.addEventListener("scroll", measure)

        return () => {
          window.removeEventListener("resize", measure)
          window.removeEventListener("scroll", measure)
        }
      }
    }
  }, [node, liveMeasure])

  return [ref, dimensions, node]
}

export default useDimensions
