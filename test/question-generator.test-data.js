function data() {
  return {
    "11": {
      "t": "We came to this beach every summer.",
      "m": "ما هر تابستان به این ساحل آمدیم."
    },
    "12": {
      "t": "It is cold.",
      "m": "سرد است."
    },
    "13": {
      "t": "It is windy.",
      "m": "باد می‌وزد."
    },
    "14": {
      "t": "It is warm.",
      "m": "گرم است."
    },
    "15": {
      "t": "It is raining.",
      "m": "باران می‌بارد."
    },
    "16": {
      "t": "What is the weather like today?",
      "m": "هوا امروز چطور است؟"
    },
    "17": {
      "t": "It is warm today.",
      "m": "امروز گرم است."
    },
    "18": {
      "t": "be",
      "m": "بودن",
      "v": 1
    },
    "19": {
      "t": "come",
      "m": "آمدن",
      "v": 1
    },
    "1": {
      "t": "summer",
      "e": "summer",
      "m": "تابستان",
      "p": 1
    },
    "2": {
      "t": "spring",
      "e": "spring",
      "m": "بهار",
      "p": 1
    },
    "3": {
      "t": "autumn",
      "e": "autumn",
      "m": "پاییز",
      "p": 1
    },
    "4": {
      "t": "winter",
      "e": "winter",
      "m": "زمستان",
      "p": 1
    },
    "5": {
      "t": "The summer is warm.",
      "m": "تابستان گرم است."
    },
    "6": {
      "t": "The winter is cold.",
      "m": "زمستان سرد است."
    },
    "7": {
      "t": "It is cold today.",
      "m": "امروز سرد است."
    },
    "8": {
      "t": "The sun shines in summer.",
      "m": "در تابستان خورشید می‌تابد."
    },
    "9": {
      "t": "It snows or rains in winter.",
      "m": "در زمستان برف یا باران می‌بارد."
    },
    "20": {
      "t": "like",
      "m": "دوست داشتن",
      "v": 1
    },
    "10": {
      "t": "These are the seasons.",
      "m": "این‌ها فصل‌ها هستند."
    },
    "21": {
      "t": "when",
      "m": "کی"
    }
  };
}

function questions() {
  return [
  {
    "uuid": "d57a609d-0c43-4160-9dfa-f356ecea824d",
    "type": "TwoPicture",
    "indexOrder": 10,
    "dynamicPart": "{\"options\":[{\"name\":\"summer.jpeg\",\"text\":\"1\"},{\"name\":\"spring.jpeg\",\"text\":\"2\"}],\"reverse\":true}"
  },
  {
    "uuid": "dab2600e-c2cf-49d7-bd01-b1753a555587",
    "type": "TwoPicture",
    "indexOrder": 20,
    "dynamicPart": "{\"options\":[{\"name\":\"autumn.jpeg\",\"text\":\"3\"},{\"name\":\"winter.jpeg\",\"text\":\"4\"}],\"reverse\":true}"
  },
  {
    "uuid": "51a9eb18-734d-4838-9844-f1c981d967a7",
    "type": "OneCheck",
    "indexOrder": 30,
    "dynamicPart": "{\"options\":[{\"text\":\"5\",\"isCorrect\":\"correct\"},{\"text\":\"6\"},{\"text\":\"7\"},{\"text\":\"8\"}]}"
  },
  {
    "uuid": "84291d34-dcf8-4ccf-82fd-4419fa8ab29c",
    "type": "FourPicture",
    "indexOrder": 40,
    "dynamicPart": "{\"options\":[{\"name\":\"summer.jpeg\",\"text\":\"1\"},{\"name\":\"spring.jpeg\",\"text\":\"2\"},{\"name\":\"autumn.jpeg\",\"text\":\"3\"},{\"name\":\"winter.jpeg\",\"text\":\"4\"}],\"reverse\":true}"
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
  }];
}

module.exports = { data: data, questions: questions };