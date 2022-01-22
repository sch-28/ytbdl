<template>
  <v-app>
    <v-main>
      <v-container
        style="width: 35%; height: 100%"
        class="d-flex align-center justify-center align-content-center flex-wrap flex-column"
      >
        <div style="width: 100%">
          <v-text-field
            :disabled="fetchingInfo"
            :loading="fetchingInfo"
            label="Youtube URL"
            :rules="rules"
            hide-details="auto"
            v-model="url"
            @input="requestInfo"
          ></v-text-field>
        </div>
        <div class="mt-5 flex-row d-flex" style="width: 50%">
          <v-text-field
            :disabled="duration == 0 || duration == -1"
            label="Start"
            hide-details="auto"
            v-model="startTime"
            :rules="[startRulesTest()]"
            class="mr-5"
          ></v-text-field>
          <v-text-field
            :disabled="duration == 0 || duration == -1"
            class="ml-5"
            label="End"
            :rules="[endRulesTest()]"
            v-model="endTime"
            hide-details="auto"
          ></v-text-field>
        </div>
        <v-btn
          :disabled="duration == 0"
          color="primary"
          class="mt-5"
          outlined
          @click="downloadVideo"
          >Download</v-btn
        >
        <!--  <video id="videoPlayer" controls>
          <source :src="finishedVideo" type="video/mp4" />
        </video> -->
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  components: {},

  data: () => ({
    fetchingInfo: false,
    url: "",
    duration: 0,
    video: null,
    endTime: "00:00:00",
    startTime: "00:00:00",

    title: null,

    rules: [
      (value) => !!value || "Required.",
      /* (value) =>
        (value &&
          !!value.match(
            /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
          )) ||
        "Not a valid url", */
    ],
  }),

  methods: {
    stringToDate(text) {
      if (text?.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/)) {
        const d = new Date(1, 1, 1);
        const t = text.split(":");
        d.setHours(t[0]);
        d.setMinutes(t[1]);
        d.setSeconds(t[2]);
        return d;
      }
      return null;
    },
    dateToString(date) {
      return date.toLocaleTimeString();
    },
    stringToSeconds(text) {
      if (text?.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/)) {
        const t = text.split(":");
        return 60 * 60 * +t[0] + +t[1] * 60 + +t[2];
      }
      return 0;
    },
    endRulesTest() {
      const startDate = this.stringToDate(this.startTime);
      const endDate = this.stringToDate(this.endTime);
      const nullDate = new Date(1, 1, 1);
      return (
        false ||
        (endDate != null &&
          startDate != null &&
          endDate <= this.duration &&
          endDate > startDate &&
          endDate > nullDate)
      );
    },
    startRulesTest() {
      const startDate = this.stringToDate(this.startTime);
      const endDate = this.stringToDate(this.endTime);
      const nullDate = new Date(1, 1, 1);

      return (
        false ||
        (startDate != null &&
          endDate != null &&
          startDate < this.duration &&
          startDate < endDate &&
          startDate >= nullDate)
      );
    },
    downloadVideo() {
      let url = "/";
      if (this.duration != -1 && this.video.length == 2) {
        url = `/api/download?video=${encodeURIComponent(
          this.video[0]
        )}&audio=${encodeURIComponent(
          this.video[1]
        )}&start=${this.stringToSeconds(this.startTime)}&duration=${
          this.stringToSeconds(this.endTime) -
          this.stringToSeconds(this.startTime)
        }&title=${this.title}`;
      } else if (this.duration != -1 && this.video.length == 1) {
        url = `/api/download?video=${encodeURIComponent(
          this.video[0]
        )}&start=${this.stringToSeconds(this.startTime)}&duration=${
          this.stringToSeconds(this.endTime) -
          this.stringToSeconds(this.startTime)
        }&title=${this.title}`;
      } else if (this.duration == -1 && this.video.length == 1) {
        url = `/api/download?video=${encodeURIComponent(
          this.video[0]
        )}&title=${this.title}`;
      }

      window.location.replace(url);
    },
    requestInfo() {
      /* if (
        !this.url.match(
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
        )
      )
        return; */

      this.fetchingInfo = true;
      this.duration = 0;
      this.video = null;
      this.endTime = "00:00:00";
      this.startTime = "00:00:00";
      this.image = null;

      fetch(`/api/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: this.url }),
      }).then((response) =>
        response.json().then((result) => {
          this.fetchingInfo = false;
          if (!result) return;
          if (result.duration == "") {
            this.duration = -1;
          } else {
            this.endTime = result.duration;
            this.duration = this.stringToDate(this.endTime);
          }
          this.video = result.video;
          this.title = result.title;
        })
      );
    },
  },
};
</script>
