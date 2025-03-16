import { describe, expect, test } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import App from "./App"

window.HTMLElement.prototype.scrollIntoView = function () {}

describe("does starting screen load", () => {
  test("loading", () => {
    render(<App />)
    expect(screen.getByText("Welcome to YesChef! Paste a recipe page (all ads and pictures included) to get started.")).toBeDefined()
  })

  test("Counter should increment by one when clicked", async () => {
    render(<App />)
    const text = screen.getByRole("textbox")///, { name: 'Ask Chef...' })
    fireEvent.change(text, { target: { value: 'Hello, Chef!' } })
    expect(await screen.getByText("Hello, Chef!")).toBeDefined()
  })
})

