import { describe, expect, test } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import App from "./App"

window.HTMLElement.prototype.scrollIntoView = function () {}

describe("does page load", () => {
  test("loading", () => {
    render(<App />)
    expect(screen.getByText("Welcome to YesChef! Paste a recipe page (all ads and pictures included) to get started.")).toBeDefined()
  })

})
