import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Form } from "./form";
import { z } from "zod";

describe("Form", function () {
  describe("stuff", function () {
    it("should work", function () {
      const schema = z.object({
        name: z.string().min(1, "Name must be at least 3 characters long"),
        organization: z.object({
          name: z.string().min(1, "Name must be at least 3 characters long"),
          ssn: z.string(),
        }),
      });

      const { container } = render(<Form schema={schema} />);

      expect(container.getElementsByTagName("input").length).toBe(3);
    });
  });
});
