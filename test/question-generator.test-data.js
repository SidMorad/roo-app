function data() {
  return {
    "11": {
      "u": "7D0nexfAMbs0ScHWL8FTKB",
      "ts": [{
        "w": "museum",
        "b": 1
      }],
      "ms": [{
        "w": "موزه",
        "b": 1
      }],
      "e": "museum"
    },
    "12": {
      "u": "3Pfq9M3cFAPj9SdynZNFxn",
      "ts": [{
        "w": "monument",
        "b": 1
      }],
      "ms": [{
        "w": "اثر تاریخی",
        "b": 1
      }],
      "e": "monument"
    },
    "13": {
      "u": "62hLETvEk0wf2GTn8YxoTT",
      "ts": [{
        "w": "What is there to see in the city?",
        "b": 1
      }],
      "ms": [{
        "w": "در شهر چه چیزی برای دیدن وجود دارد؟",
        "b": 1
      }],
      "e": "What is there to see in the city?"
    },
    "14": {
      "u": "7IvIhmVKnYQgWaIqOj4sUh",
      "ts": [{
        "w": "I travel the world.",
        "b": 1
      }],
      "ms": [{
        "w": "من دنیا را سفر می‌کنم.",
        "b": 1
      }],
      "e": "I travel the world."
    },
    "15": {
      "u": "6z9pL6l84HFO0NDSHnI6oz",
      "ts": [{
        "w": "Is the museum open on Thursdays?",
        "b": 1
      }],
      "ms": [{
        "w": "موزه پنج شنبه‌ها باز است؟",
        "b": 1
      }],
      "e": "Is the museum open on Thursdays?"
    },
    "16": {
      "u": "6FTCgPnVS2FrDQ0B8ooRFP",
      "ts": [{
        "w": "Have a nice trip.",
        "b": 1
      }],
      "ms": [{
        "w": "سفر خوبی داشته باشید.",
        "b": 1
      }],
      "e": "Have a nice trip."
    },
    "1": {
      "u": "4UuCQ6RIAqHZziRVIRyYnX",
      "ts": [{
        "w": "travel",
        "b": 1
      }],
      "ms": [{
        "w": "مسافرت کردن",
        "b": 1
      }],
      "e": "travel",
      "v": 1,
      "p": 1
    },
    "2": {
      "u": "7D0nexfAMbs0ScHWL8FTKB",
      "ts": [{
        "w": "museum",
        "b": 1
      }],
      "ms": [{
        "w": "موزه",
        "b": 1
      }],
      "e": "museum",
      "p": 1
    },
    "3": {
      "u": "2nljz3oCsg9ci9Z8hVrgYX",
      "ts": [{
        "w": "world",
        "b": 1
      }],
      "ms": [{
        "w": "جهان",
        "b": 1
      }],
      "e": "world"
    },
    "4": {
      "u": "5S1Z35nDt7qzNGC7YRAbdf",
      "ts": [{
        "w": "city",
        "b": 1
      }],
      "ms": [{
        "w": "شهر",
        "b": 1
      }],
      "e": "city"
    },
    "5": {
      "u": "4UuCQ6RIAqHZziRVIRyYnX",
      "ts": [{
        "w": "travel",
        "b": 1
      }],
      "ms": [{
        "w": "مسافرت کردن",
        "b": 1
      }],
      "e": "travel",
      "v": 1
    },
    "6": {
      "u": "3NZc4hWw2IGrQx4eTEh2MW",
      "ts": [{
        "w": "country",
        "b": 1
      }],
      "ms": [{
        "w": "کشور",
        "b": 1
      }],
      "e": "country",
      "p": 1
    },
    "7": {
      "u": "3Pfq9M3cFAPj9SdynZNFxn",
      "ts": [{
        "w": "monument",
        "b": 1
      }],
      "ms": [{
        "w": "اثر تاریخی",
        "b": 1
      }],
      "e": "monument",
      "p": 1
    },
    "8": {
      "u": "7TwQiNl6bSLucqQlwcX71R",
      "ts": [{
        "w": "national park",
        "b": 1
      }],
      "ms": [{
        "w": "باغ ملی",
        "b": 1
      }],
      "e": "national park"
    },
    "9": {
      "u": "78WJXgcf8RqQCxFAjCBqFj",
      "ts": [{
        "w": "trip",
        "b": 1
      }],
      "ms": [{
        "w": "سفر",
        "b": 1
      }],
      "e": "trip"
    },
    "10": {
      "u": "3NZc4hWw2IGrQx4eTEh2MW",
      "ts": [{
        "w": "country",
        "b": 1
      }],
      "ms": [{
        "w": "کشور",
        "b": 1
      }],
      "e": "country"
    }
  };
}

function questions() {
  return [{
      "uuid": "d57a609d-0c43-4160-9dfa-f356ecea824d",
      "type": "TwoPicture",
      "indexOrder": 10,
      "dynamicPart": "{\"options\":[{\"name\":\"travel.jpeg\",\"text\":\"1\"},{\"name\":\"museum.jpeg\",\"text\":\"2\"}],\"reverse\":true}"
    },
    {
      "uuid": "dab2600e-c2cf-49d7-bd01-b1753a555587",
      "type": "TwoPicture",
      "indexOrder": 20,
      "dynamicPart": "{\"options\":[{\"name\":\"world.jpeg\",\"text\":\"3\"},{\"name\":\"city.jpeg\",\"text\":\"4\"}],\"reverse\":true}"
    },
    {
      "uuid": "51a9eb18-734d-4838-9844-f1c981d967a7",
      "type": "SpellSelect",
      "indexOrder": 30,
      "dynamicPart": "{\"question\":\"3\"}"
    },
    {
      "uuid": "84291d34-dcf8-4ccf-82fd-4419fa8ab29c",
      "type": "FourPicture",
      "indexOrder": 40,
      "dynamicPart": "{\"options\":[{\"name\":\"travel.jpeg\",\"text\":\"1\"},{\"name\":\"museum.jpeg\",\"text\":\"2\"},{\"name\":\"world.jpeg\",\"text\":\"3\"},{\"name\":\"city.jpeg\",\"text\":\"4\"}],\"reverse\":true}"
    },
    {
      "uuid": "e348d5fb-3ce6-4675-9c2e-428c9b4bc4ca",
      "type": "OneCheck",
      "indexOrder": 50,
      "dynamicPart": "{\"options\":[{\"text\":\"5\"},{\"text\":\"6\",\"isCorrect\":\"correct\"},{\"text\":\"7\"},{\"text\":\"8\"}]}"
    },
    {
      "uuid": "4539f118-aad6-4d7c-80cc-4042bb622738",
      "type": "Speaking",
      "indexOrder": 60,
      "dynamicPart": "{\"question\":\"9\"}"
    },
    {
      "uuid": "048ffdb9-20f7-499d-80e4-3482b24f6bca",
      "type": "MultiSelect",
      "indexOrder": 70,
      "dynamicPart": "{\"question\":\"8\",\"options\":[{\"text\":\"9\"}]}"
    },
    {
      "uuid": "bdfb5f18-4463-4120-b875-064db2e64abd",
      "type": "Speaking",
      "indexOrder": 80,
      "dynamicPart": "{\"question\":\"10\"}"
    },
    {
      "uuid": "c2729999-db43-4bb8-a4f7-c2e044e84ed2",
      "type": "MultiSelect",
      "indexOrder": 90,
      "dynamicPart": "{\"question\":\"7\",\"options\":[{\"text\":\"6\"}],\"reverse\":true}"
    },
    {
      "uuid": "ca338611-9e0d-4efd-b801-d11f4833ade4",
      "type": "Speaking",
      "indexOrder": 100,
      "dynamicPart": "{\"question\":\"11\"}"
    },
    {
      "uuid": "5f787112-0946-4275-9b0a-b7c593a40cd4",
      "type": "OneCheck",
      "indexOrder": 110,
      "dynamicPart": "{\"options\":[{\"text\":\"12\"},{\"text\":\"13\"},{\"text\":\"14\"},{\"text\":\"15\",\"isCorrect\":\"correct\"}]}"
    },
    {
      "uuid": "bd8d483e-67b0-4b42-a605-4fd65311c1f6",
      "type": "Speaking",
      "indexOrder": 120,
      "dynamicPart": "{\"question\":\"16\"}"
    },
    {
      "uuid": "530985bc-a519-426e-902c-8af0a2d6a317",
      "type": "OneCheck",
      "indexOrder": 130,
      "dynamicPart": "{\"options\":[{\"text\":\"12\"},{\"text\":\"13\",\"isCorrect\":\"correct\"},{\"text\":\"14\"},{\"text\":\"15\"}]}"
    },
    {
      "uuid": "67077716-4bf2-411a-bfb5-a666dbcdd7a6",
      "type": "MultiSelect",
      "indexOrder": 140,
      "dynamicPart": "{\"question\":\"17\",\"options\":[{\"text\":\"5\"}],\"reverse\":true}"
    },
    {
      "uuid": "8df7b9fe-1997-472e-8794-671b297fdc3a",
      "type": "MultiSelect",
      "indexOrder": 150,
      "dynamicPart": "{\"question\":\"9\",\"options\":[{\"text\":\"13\"}]}"
    },
    {
      "uuid": "05da1b64-3917-4be1-ab49-bb25e8d473c0",
      "type": "MultiSelect",
      "indexOrder": 160,
      "dynamicPart": "{\"question\":\"15\",\"options\":[{\"text\":\"19\"}],\"reverse\":true}"
    },
    {
      "uuid": "58041a0a-daad-4060-985e-57108d3ce42a",
      "type": "Speaking",
      "indexOrder": 170,
      "dynamicPart": "{\"question\":\"8\"}"
    },
    {
      "uuid": "dba45729-7b3c-4d5f-bb48-9f87823db789",
      "type": "MultiSelect",
      "indexOrder": 180,
      "dynamicPart": "{\"question\":\"14\",\"options\":[{\"text\":\"12\"}],\"listen\":true}"
    }
  ];
}

module.exports = {
  data: data,
  questions: questions
};