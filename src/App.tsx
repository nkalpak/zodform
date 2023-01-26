import "./App.css";
import { Form } from "./core/form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  organization: z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    ssn: z.string(),
  }),
  gender: z.enum(["male", "female", "other"] as const),
});

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
