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
  return (
    <>
      <AppShell padding="md" header={{ height: 60 }}>
        <AppShell.Header>Test</AppShell.Header>
        <AppShell.Main>
          <Center maw="100%" h="80vh">
            <Stack align="center">
              <Title order={1}>LinkChop</Title>
              <Group align="center">
                <Input placeholder="URL to Chop" size="lg" w={500} />
                <Button size="lg">Chop</Button>
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
