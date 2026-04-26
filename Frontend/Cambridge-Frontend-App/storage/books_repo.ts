const AMERICAN_UNITS = [
      "Unit 1A", "Unit 1B", "Unit 1C",
      "Unit 2A", "Unit 2B", "Unit 2C",
      "Unit 3A", "Unit 3B", "Unit 3C",
      "Unit 4A", "Unit 4B", "Unit 4C",
      "Unit 5A", "Unit 5B", "Unit 5C",
      "Unit 6A", "Unit 6B", "Unit 6C",
      "Unit 7A", "Unit 7B", "Unit 7C",
      "Unit 8A", "Unit 8B", "Unit 8C",
      "Unit 9A", "Unit 9B", "Unit 9C",
      "Unit 10A", "Unit 10B", "Unit 10C",
      "Unit 11A", "Unit 11B", "Unit 11C",
      "Unit 12A", "Unit 12B", "Unit 12C",
    ];

export const DEFAULT_BOOKS = {
  american_english_1: {
    id: "1",
    name: "American English 1",
    units: AMERICAN_UNITS
  },
  american_english_2: {
    id: "2",
    name: "American English 2",
    units: AMERICAN_UNITS
  },
  american_english_3: {
    id: "3",
    name: "American English 3",
    units: AMERICAN_UNITS
  },
  american_english_4: {
    id: "4",
    name: "American English 4",
    units: AMERICAN_UNITS
  },
  american_english_5: {
    id: "5",
    name: "American English 5",
    units: AMERICAN_UNITS
  },

  link_it_1: {
    id: "6",
    name: "Link It 1",
    units: [
      "Unit 1: It's your big day!",
      "Unit 2: Are you ready?",
      "Unit 3: Are There any movie channels on your TV?",
      "Unit 4: Do you have my sunglasses?",
      "Unit 5: I get up at six 'o clock",
      "Unit 6: You don't know him",
      "Unit 7: You can talk to girls!",
      "Unit 8: The music's starting",
    ]
  },
  link_it_2: {
    id: "7",
    name: "Link It 2",
    units: [
      "Unit 1: Look who's coming ...",
      "Unit 2: Was she there?",
      "Unit 3: We stopped at the market",
      "Unit 4: Why did you take her phone?",
      "Unit 5: You have to say something",
      "Unit 6: You musn't be late",
      "Unit 7: How much salt did you put in this?",
      "Unit 8: The best trip ever!"
    ]
  },
  link_it_3: {
    id: "8",
    name: "Link It 3",
    units: [
      "Unit 1: What am I going to do?",
      "Unit 2: What will happen if ...?",
      "Unit 3: What have you done?",
      "Unit 4: I think you've just broken them",
      "Unit 5: Was he causing trouble?",
      "Unit 6: What should I do?",
      "Unit 7: She still likes him, doesn't she",
      "Unit 8: People who have made history"
    ]
  },
  link_it_4: {
    id: "9",
    name: "Link It 4",
    units: [
      "Unit 1: It's my life!",
      "Unit 2: Live by the rules!",
      "Unit 3: So happy together!",
      "Unit 4: Screen Time!",
      "Unit 5: Mind, body, spirit",
      "Unit 6: A better world!",
      "Unit 7: Use your imagination",
      "Unit 8: Wish you were here!"
    ]
  },
  link_it_5: {
    id: "10",
    name: "Link It 5",
    units: [
      "Unit 1: Forward thinking!",
      "Unit 2: Do the right thing!",
      "Unit 3: On the money!",
      "Unit 4: Our digital lives",
      "Unit 5: Media matters",
      "Unit 6: Food for thought"
    ]
  },
  link_it_6: {
    id: "11",
    name: "Link It 6",
    units: [
      "Unit 1: My social media life",
      "Unit 2: Life's an adventure",
      "Unit 3: All in the mind",
      "Unit 4: The future is bright",
      "Unit 5: Fit for life",
      "Unit 6: Looking good"
    ]
  },
  everybody_up_1: {
    id: "12",
    name: "Everybody Up! 1",
    units: [
      "Unit 1: First Day",
      "Unit 2: Art Class",
      "Unit 3: Birthday Party",
      "Unit 4: Home",
      "Unit 5: The Park",
      "Unit 6: The Zoo",
      "Unit 7: Science Day",
      "Unit 8: The Toy Store"
    ]
  },
  everybody_up_2: {
    id: "13",
    name: "Everybody Up! 2",
    units: [
      "Unit 1: How We Feel",
      "Unit 2: In Town",
      "Unit 3: Things to Eat",
      "Unit 4: Things to Wear",
      "Unit 5: Things to Do",
      "Unit 6: Home",
      "Unit 7: My Day",
      "Unit 8: My Week"
    ]
  },
  everybody_up_3: {
    id: "14",
    name: "Everybody Up! 3",
    units: [
      "Unit 1: Things to Eat",
      "Unit 2: Around Town",
      "Unit 3: People in Town",
      "Unit 4: Getting Together",
      "Unit 5: Fun in the Park",
      "Unit 6: Helping Out",
      "Unit 7: Out and About",
      "Unit 8: Things We Use"
    ]
  },
  everybody_up_4: {
    id: "15",
    name: "Everybody Up! 4",
    units: [
      "Unit 1: Fun Outdoors",
      "Unit 2: Land and Sea",
      "Unit 3: Appearance",
      "Unit 4: Last Week",
      "Unit 5: A Day Out",
      "Unit 6: Being Creative",
      "Unit 7: Things to Be",
      "Unit 8: On Vacation"
    ]
  },
  everybody_up_5: {
    id: "16",
    name: "Everybody Up! 5",
    units: [
      "Unit 1: Vacation",
      "Unit 2: Camping",
      "Unit 3: Class Party",
      "Unit 4: The Amazon Rain Forest",
      "Unit 5: Busy Students",
      "Unit 6: Making Things",
      "Unit 7: World Travel",
      "Unit 8: Computers"
    ]
  },
  everybody_up_6: {
    id: "17",
    name: "Everybody Up! 6",
    units: [
      "Unit 1: Getting Around",
      "Unit 2: Family Life",
      "Unit 3: Student Life",
      "Unit 4: Wants and Needs",
      "Unit 5: Around Town",
      "Unit 6: Our Planet",
      "Unit 7: Achievements",
      "Unit 8: Graduation Day"
    ]
  }
} as const;
export type BookId = keyof typeof DEFAULT_BOOKS;