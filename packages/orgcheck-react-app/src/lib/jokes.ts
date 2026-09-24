export type Joke = { question: string; answer: string };

export const ALL_JOKES: Joke[] = [
  {
    question: `Chances are if you've seen one shopping center...`,
    answer: `You've seen a mall`,
  },
  {
    question: `Did you hear about the artist that was baroque?`,
    answer: `He stole the Monet, to buy Degas, to make the Van Gogh.`,
  },
  {
    question: `Did you know Stephen King has a son named Joe?`,
    answer: `I am not joking, but he is.`,
  },
  {
    question: `Doctor: How is that kid who swallowed those coins doing?`,
    answer: `Nurse: No change yet.`,
  },
  {
    question: `Don't mess up with French people`,
    answer: `We eat pain for breakfast`,
  },
  {
    question: `How can you tell a vampire has a cold?`,
    answer: `They start coffin.`,
  },
  {
    question: `How did Darth Vader know what Luke was getting for his birthday?`,
    answer: `He felt his presents!`,
  },
  {
    question: `How do you organize a space party?`,
    answer: `You planet.`,
  },
  {
    question: `How do you turn deviled eggs into regular eggs?`,
    answer: `It takes an eggsorcism.`,
  },
  { question: `I just crashed my new kia`, answer: `Now I have Nokia` },
  {
    question: `I just downloaded the Titanic soundtrack...`,
    answer: `It's syncing right now.`,
  },
  {
    question: `I tried to climb a really tall tower in France...`,
    answer: `but Eiffel off`,
  },
  {
    question: `I was going to get a brain transplant...`,
    answer: `but I changed my mind`,
  },
  {
    question: `I went to a prison poetry reading...`,
    answer: `It had it's prose and cons`,
  },
  {
    question: `I'm writing a book about reverse psychology.`,
    answer: `Please don't buy it...`,
  },
  {
    question: `If you have way too many dad-jokes, where can you store them all?`,
    answer: `In a dadda-lake`,
  },
  {
    question: `Why did the coffee file a police report?`,
    answer: `It got mugged.`,
  },
  {
    question: `Why did the math book look sad?`,
    answer: `Because it had too many problems.`,
  },
  {
    question: `Why do the French eat snails?`,
    answer: `They don't like fast food`,
  },
  { question: `Why are ghosts bad liars?`, answer: `Because you can see right through them!` },
];

export function pickJokesOfTheDay(count = 5): Joke[] {
  const pool = [...ALL_JOKES];
  const selected: Joke[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
}

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];
