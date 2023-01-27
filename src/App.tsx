import "./App.css";
import { Form } from "./core/form";
import { z } from "zod";

const base = z.object({
  name: z.string().min(1, "Name must be at least 3 characters long"),
  organization: z.object({
    name: z.string().min(1, "Name must be at least 3 characters long"),
    ssn: z.string(),
  }),
  gender: z.enum(["male", "female", "other"] as const),
  fruits: z.array(z.string()),
});

const schema = z.union([
  base,
  base
    .partial({
      name: true,
      gender: true,
      fruits: true,
    })
    .merge(
      z.object({
        organization: z.object({
          name: z.string().min(6, "Name must be at least 6 characters long"),
          ssn: z.string().min(10, "SSN must be at least 10 characters long"),
        }),
      })
    ),
]);

function App() {
  return (
    <div className="App">
      <Form
        schema={schema}
        onSubmit={(values) => {
          console.log(values);
        }}
      />
    </div>
  );
}

export default App;
