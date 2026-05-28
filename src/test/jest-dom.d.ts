// Loads @testing-library/jest-dom's matcher augmentation onto vitest's `expect`
// (toBeInTheDocument, toHaveAttribute, …) for type-checking. Picked up via the
// tsconfig `include: ["src"]` glob. Self-contained — see docs/DEVELOPMENT.md §5.
import "@testing-library/jest-dom/vitest";
