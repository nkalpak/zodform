import "./App.css";
import { Form } from "./form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name must be at least 3 characters long"),
  organization: z.object({
    name: z.string().min(1, "Name must be at least 3 characters long"),
    ssn: z.string(),
  }),
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
