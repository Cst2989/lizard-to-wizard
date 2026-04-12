import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "../SearchForm";

describe("SearchForm", () => {
  it("renders destination dropdown with 5 cities", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);

    const select = screen.getByLabelText(/destination/i);
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    // 5 cities + 1 placeholder
    expect(options.length).toBe(6);
  });

  it("renders date inputs for from and to", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);

    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
  });

  it("renders a search button", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={false} />);

    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("calls onSearch with dest, from, to when submitted", async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();

    render(<SearchForm onSearch={onSearch} isLoading={false} />);

    await user.selectOptions(screen.getByLabelText(/destination/i), "PAR");
    await user.clear(screen.getByLabelText(/from/i));
    await user.type(screen.getByLabelText(/from/i), "2026-06-01");
    await user.clear(screen.getByLabelText(/to/i));
    await user.type(screen.getByLabelText(/to/i), "2026-06-07");
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("PAR", "2026-06-01", "2026-06-07");
  });

  it("disables button when isLoading is true", () => {
    render(<SearchForm onSearch={vi.fn()} isLoading={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
