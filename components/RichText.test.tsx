// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichText } from "./RichText";

describe("RichText", () => {
  it("renders markdown emphasis as real elements with no stray asterisks", () => {
    const { container } = render(
      <p>
        <RichText text={"A resposta é **since**, não *for*.\n* Revise o present perfect\n- Veja `has been`"} />
      </p>,
    );

    expect(container.querySelector("strong")?.textContent).toBe("since");
    expect(container.querySelector("em")?.textContent).toBe("for");
    expect(container.querySelector("code")?.textContent).toBe("has been");
    expect(container.textContent).not.toContain("*");
    expect(container.textContent).toContain("• Revise o present perfect");
    expect(container.textContent).toContain("• Veja has been");
  });

  it("leaves plain text as it is", () => {
    const { container } = render(<RichText text="Sem formatação nenhuma." />);
    expect(container.textContent).toBe("Sem formatação nenhuma.");
    expect(container.querySelector("strong")).toBeNull();
  });
});
