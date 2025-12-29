import { useState } from "react";
import { shake128 } from "js-sha3";

import {
  Button,
  Input,
  Container,
  AppShell,
  Title,
  Center,
  Stack,
  Group,
} from "@mantine/core";

function App() {
  const [url, setUrl] = useState("");

  const handleEncode = (input) => {
    console.log("Encoding: ", input);
    shake128(input, 10);
    console.log("Encoded: ", shake128(input, 24));
  };

  return (
    <>
      <AppShell padding="md" header={{ height: 60 }}>
        <AppShell.Header>Test</AppShell.Header>
        <AppShell.Main>
          <Center maw="100%" h="80vh">
            <Stack align="center">
              <Title order={1}>LinkChop</Title>
              <Group align="center">
                <Input
                  placeholder="URL to Chop"
                  size="lg"
                  w={500}
                  value={url}
                  onChange={(event) => setUrl(event.currentTarget.value)}
                />
                <Button size="lg" onClick={() => handleEncode(url)}>
                  Chop
                </Button>
              </Group>
            </Stack>
          </Center>
        </AppShell.Main>
        <AppShell.Footer>Footer</AppShell.Footer>
      </AppShell>
    </>
  );
}

export default App;
