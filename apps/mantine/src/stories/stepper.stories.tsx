import { z } from 'zod';
import React from 'react';
import { Alert, Button, Container, Stepper, Text } from '@mantine/core';
import { Form, FormUiSchema, FormValue } from '@zodform/core';
import { mantineComponents } from '../components/mantine-components';

const step1 = z.object({
  firstName: z.string(),
  lastName: z.string()
});

const step1Ui: FormUiSchema<typeof step1> = {
  lastName: {
    label: 'Last name'
  },
  firstName: {
    label: 'First name'
  }
};

const step2 = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string()
});

const step2Ui: FormUiSchema<typeof step2> = {
  street: {
    label: 'Street'
  },
  city: {
    label: 'City'
  },
  state: {
    label: 'State'
  },
  zip: {
    label: 'Zip'
  }
};

export function StepperStory() {
  const [activeStep, setActiveStep] = React.useState(0);

  const [step1Value, setStep1Value] = React.useState<FormValue<typeof step1>>();
  const [step2Value, setStep2Value] = React.useState<FormValue<typeof step2>>();

  const isCompleted = step1Value && step2Value;

  return (
    <Container size="xs">
      {!isCompleted && (
        <Stepper
          allowNextStepsSelect={step1Value !== undefined}
          onStepClick={setActiveStep}
          active={activeStep}
        >
          <Stepper.Step title="Personal info">
            <Form
              components={mantineComponents}
              schema={step1}
              uiSchema={step1Ui}
              onSubmit={(value) => {
                setStep1Value(value);
                setActiveStep(1);
              }}
            >
              {() => <Button type="submit">Next</Button>}
            </Form>
          </Stepper.Step>

          <Stepper.Step title="Address">
            <Form components={mantineComponents} schema={step2} uiSchema={step2Ui} onSubmit={setStep2Value}>
              {() => <Button type="submit">Finish</Button>}
            </Form>
          </Stepper.Step>
        </Stepper>
      )}

      {isCompleted && (
        <Alert bg="blue">
          <Text c="white">Thank you for submitting the form!</Text>
        </Alert>
      )}
    </Container>
  );
}
