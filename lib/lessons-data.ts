export type Lesson = {
  id: string
  title: string
  description: string
  duration: string
  videoUrl?: string
  content: string
}

export type CourseData = {
  [courseId: string]: Lesson[]
}

export const courseLessons: CourseData = {
  mathematics: [
    {
      id: "math-1",
      title: "Introduction to Numbers",
      description: "Learn about counting and basic numbers from 1 to 100",
      duration: "15 min",
      content: `
# Introduction to Numbers

Welcome to your first mathematics lesson! Today we'll learn about numbers from 1 to 100.

## What are Numbers?

Numbers are symbols we use to count things. We see numbers everywhere - on clocks, calendars, price tags, and even on your favorite game scores!

## Counting from 1 to 10

Let's start with the basics:
- **1** - One (like one apple)
- **2** - Two (like two eyes)
- **3** - Three (like three wheels on a tricycle)
- **4** - Four (like four legs on a chair)
- **5** - Five (like five fingers on one hand)
- **6** - Six (like six sides on a dice)
- **7** - Seven (like seven days in a week)
- **8** - Eight (like eight legs on an octopus)
- **9** - Nine (like nine planets... well, eight now!)
- **10** - Ten (like ten toes)

## Practice Activity

Try counting objects around you! How many windows are in your room? How many books are on your shelf?

## Key Takeaway

Numbers help us count, measure, and understand the world around us. The more you practice, the better you'll become!
      `,
    },
    {
      id: "math-2",
      title: "Addition Basics",
      description: "Learn how to add numbers together",
      duration: "20 min",
      content: `
# Addition Basics

Addition is putting numbers together to find a total!

## The Addition Symbol (+)

When we want to add numbers, we use the plus sign (+). For example:
- 2 + 3 = 5 (two plus three equals five)

## Simple Addition Examples

Let's practice with some easy examples:

- **1 + 1 = 2** (One apple plus one apple equals two apples)
- **2 + 2 = 4** (Two birds plus two birds equals four birds)
- **3 + 2 = 5** (Three balls plus two balls equals five balls)
- **4 + 3 = 7** (Four stars plus three stars equals seven stars)
- **5 + 5 = 10** (Five fingers plus five fingers equals ten fingers)

## Tips for Adding

1. Start with the bigger number
2. Count up from there
3. Use your fingers if you need help!

## Practice Problems

Try these on your own:
- 3 + 4 = ?
- 2 + 5 = ?
- 6 + 2 = ?

## Great Job!

Keep practicing and addition will become super easy!
      `,
    },
    {
      id: "math-3",
      title: "Subtraction Fun",
      description: "Learn how to take away numbers",
      duration: "20 min",
      content: `
# Subtraction Fun

Subtraction means taking away from a group!

## The Subtraction Symbol (-)

When we subtract, we use the minus sign (-). For example:
- 5 - 2 = 3 (five minus two equals three)

## Understanding Subtraction

Imagine you have 5 cookies and you eat 2. How many are left?
5 - 2 = 3 cookies left!

## Practice Examples

- **4 - 1 = 3** (Four toys, give away one, three left)
- **6 - 2 = 4** (Six crayons, lose two, four remain)
- **10 - 5 = 5** (Ten grapes, eat five, five left)

## Subtraction Tips

1. Start with the bigger number
2. Count backwards
3. Think about "taking away"

Keep practicing!
      `,
    },
    {
      id: "math-4",
      title: "Shapes and Patterns",
      description: "Discover circles, squares, triangles and more",
      duration: "25 min",
      content: `
# Shapes and Patterns

Let's explore the wonderful world of shapes!

## Basic Shapes

### Circle
- Round like a ball
- No corners
- Examples: wheels, cookies, the sun

### Square
- 4 equal sides
- 4 corners
- Examples: windows, crackers, tiles

### Triangle
- 3 sides
- 3 corners
- Examples: pizza slices, rooftops, yield signs

### Rectangle
- 4 sides (2 long, 2 short)
- 4 corners
- Examples: doors, phones, books

## Finding Shapes Around You

Look around your room! Can you find:
- Something circular?
- Something square?
- Something triangular?

Shapes are everywhere once you start looking!
      `,
    },
    {
      id: "math-5",
      title: "Multiplication Introduction",
      description: "Learn the basics of multiplication",
      duration: "30 min",
      content: `
# Multiplication Introduction

Multiplication is a faster way to add the same number many times!

## What is Multiplication?

Instead of adding 2 + 2 + 2, we can say 2 × 3 = 6

The × symbol means "times" or "groups of"

## Easy Examples

- **2 × 2 = 4** (2 groups of 2)
- **3 × 3 = 9** (3 groups of 3)
- **4 × 2 = 8** (4 groups of 2)
- **5 × 2 = 10** (5 groups of 2)

## Times Tables Tips

Start learning your 2s, 5s, and 10s first - they're the easiest!

Practice makes perfect!
      `,
    },
  ],
  science: [
    {
      id: "sci-1",
      title: "The Solar System",
      description: "Explore planets and stars in our universe",
      duration: "25 min",
      content: `
# The Solar System

Welcome to space exploration!

## What is the Solar System?

Our solar system is like a big family with the Sun at the center. Eight planets orbit (go around) the Sun.

## The Planets

1. **Mercury** - Smallest and closest to the Sun
2. **Venus** - Hottest planet
3. **Earth** - Our home! Has water and life
4. **Mars** - The red planet
5. **Jupiter** - Biggest planet
6. **Saturn** - Has beautiful rings
7. **Uranus** - Tilted on its side
8. **Neptune** - Farthest from the Sun

## Fun Facts

- The Sun is a star!
- It takes Earth 365 days to orbit the Sun
- Jupiter is so big, 1,300 Earths could fit inside it!

Space is amazing!
      `,
    },
    {
      id: "sci-2",
      title: "Plants and How They Grow",
      description: "Learn about seeds, roots, and leaves",
      duration: "20 min",
      content: `
# Plants and How They Grow

Let's discover the secret life of plants!

## Parts of a Plant

- **Roots** - Underground, drink water
- **Stem** - Holds the plant up
- **Leaves** - Make food from sunlight
- **Flowers** - Make seeds
- **Seeds** - Grow into new plants

## What Plants Need

1. **Sunlight** - For energy
2. **Water** - To drink and stay healthy
3. **Soil** - For nutrients
4. **Air** - For breathing (yes, plants breathe!)

## Try This!

Plant a seed and watch it grow! Water it a little each day and put it in a sunny spot.
      `,
    },
    {
      id: "sci-3",
      title: "Animal Habitats",
      description: "Where do different animals live?",
      duration: "22 min",
      content: `
# Animal Habitats

A habitat is a place where an animal lives!

## Types of Habitats

### Forest
- Bears, deer, owls, squirrels
- Lots of trees

### Ocean
- Fish, whales, dolphins, sharks
- Salty water

### Desert
- Camels, snakes, lizards
- Hot and dry

### Arctic
- Polar bears, penguins, seals
- Very cold, lots of ice

## Why Habitats Matter

Animals are perfectly suited to their homes. A polar bear's thick fur keeps it warm in the Arctic!
      `,
    },
    {
      id: "sci-4",
      title: "The Water Cycle",
      description: "How water moves around Earth",
      duration: "18 min",
      content: `
# The Water Cycle

Water goes on an amazing journey!

## The Steps

1. **Evaporation** - Sun heats water, it rises as vapor
2. **Condensation** - Vapor forms clouds
3. **Precipitation** - Water falls as rain or snow
4. **Collection** - Water gathers in lakes, rivers, oceans

Then it starts all over again!

## Fun Fact

The water you drink today might have been drunk by a dinosaur millions of years ago!
      `,
    },
  ],
  english: [
    {
      id: "eng-1",
      title: "The Alphabet Song",
      description: "Learn all 26 letters A to Z",
      duration: "15 min",
      content: `
# The Alphabet Song

Let's learn our ABCs!

## The 26 Letters

A B C D E F G
H I J K L M N O P
Q R S T U V
W X Y and Z

Now I know my ABCs,
Next time won't you sing with me?

## Vowels vs Consonants

**Vowels:** A, E, I, O, U (and sometimes Y)
**Consonants:** All the other letters!

## Practice

Try writing each letter! Start with your name.
      `,
    },
    {
      id: "eng-2",
      title: "Sight Words",
      description: "Common words every reader should know",
      duration: "20 min",
      content: `
# Sight Words

Sight words are words you should recognize instantly!

## Common Sight Words

- the, a, an, is, it
- he, she, we, you, they
- and, but, or, so
- can, will, do, have
- this, that, what, when

## Why Learn Them?

These words appear in almost every book! Knowing them makes reading much easier and faster.

## Practice Tip

Make flashcards and practice every day!
      `,
    },
    {
      id: "eng-3",
      title: "Story Time Basics",
      description: "Understanding beginning, middle, and end",
      duration: "25 min",
      content: `
# Story Time Basics

Every story has three main parts!

## Beginning

- Introduces characters
- Sets the scene
- "Once upon a time..."

## Middle

- The main action happens
- Problems arise
- Adventures unfold

## End

- Problems are solved
- "The End" or "Happily ever after"

## Try Writing Your Own!

Think of a character, a problem, and how they solve it!
      `,
    },
  ],
  "social-studies": [
    {
      id: "ss-1",
      title: "Maps and Directions",
      description: "Learn to read maps and find your way",
      duration: "20 min",
      content: `
# Maps and Directions

Maps help us find places!

## The Four Directions

- **North** - Up on a map
- **South** - Down on a map
- **East** - Right on a map
- **West** - Left on a map

## Parts of a Map

- **Title** - Tells what the map shows
- **Key/Legend** - Explains symbols
- **Compass Rose** - Shows directions

## Fun Activity

Draw a map of your bedroom or classroom!
      `,
    },
    {
      id: "ss-2",
      title: "Community Helpers",
      description: "People who help our community",
      duration: "18 min",
      content: `
# Community Helpers

Many people work to help us every day!

## Who Are They?

- **Doctors & Nurses** - Keep us healthy
- **Teachers** - Help us learn
- **Firefighters** - Put out fires, rescue people
- **Police Officers** - Keep us safe
- **Mail Carriers** - Deliver letters
- **Farmers** - Grow our food

## Thank You!

Next time you see a community helper, say thank you!
      `,
    },
  ],
  "art-craft": [
    {
      id: "art-1",
      title: "Color Mixing Magic",
      description: "Learn how to create new colors",
      duration: "20 min",
      content: `
# Color Mixing Magic

Let's discover how colors work together!

## Primary Colors

Red, Yellow, Blue - You can't make these by mixing!

## Secondary Colors

- Red + Yellow = **Orange**
- Yellow + Blue = **Green**
- Blue + Red = **Purple**

## Try This!

Get some paint and experiment! What happens when you add white? (Colors get lighter - these are called tints!)
      `,
    },
    {
      id: "art-2",
      title: "Paper Folding Fun",
      description: "Simple origami for beginners",
      duration: "25 min",
      content: `
# Paper Folding Fun

Origami is the art of folding paper!

## What You Need

- Square paper
- A flat surface
- Clean hands

## Simple Projects

1. **Paper Airplane** - Classic and fun!
2. **Fortune Teller** - Play with friends
3. **Paper Boat** - Float it in water

## Tips

- Make crisp, clean folds
- Take your time
- Practice makes perfect!
      `,
    },
  ],
  music: [
    {
      id: "mus-1",
      title: "Rhythm and Beat",
      description: "Understanding musical timing",
      duration: "15 min",
      content: `
# Rhythm and Beat

Music has a heartbeat called rhythm!

## What is Beat?

The steady pulse in music. Like a clock: tick, tick, tick...

## What is Rhythm?

The pattern of sounds. Some are long, some are short!

## Try This!

Clap along to your favorite song. Can you feel the beat?

- Clap on the strong beats
- Tap your foot
- Nod your head

You're making music!
      `,
    },
    {
      id: "mus-2",
      title: "Musical Notes",
      description: "Learn about do, re, mi",
      duration: "20 min",
      content: `
# Musical Notes

Notes are the building blocks of music!

## The Scale

Do - Re - Mi - Fa - Sol - La - Ti - Do

Each note is a different pitch (high or low)!

## Singing the Scale

Try singing:
"Do, a deer, a female deer..."

From The Sound of Music - a great way to remember!

## Fun Fact

There are only 7 main notes, but they can make millions of songs!
      `,
    },
  ],
}
