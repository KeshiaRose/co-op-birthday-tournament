/* global Vue */

const { createApp } = Vue;

const app = Vue.createApp({
  data() {
    return {
      players: [],
    };
  },
  computed: {
    rankedPlayers() {
      if (this.players.length === 0) return [];
      let players = this.players.slice();
      players = players.filter((player) => !player.name.startsWith('Player'));
      if (players.length === 0) return [];
      players = players.map((player) => {
        return { color: this.stringToHSLColor(player.name), ...player };
      });
      players.sort((a, b) => a.name.localeCompare(b.name));
      players.sort((a, b) => b.score - a.score);

      // Rank players with standard competitive ranking
      let rank = 1;
      players[0].rank = rank;
      for (let i = 1; i < players.length; i++) {
        if (players[i].score === players[i - 1].score) {
          players[i].rank = rank;
        } else {
          rank = i + 1;
          players[i].rank = rank;
        }
      }

      // Add awards
      if (players[players.length - 2]) players[players.length - 2].award = 'second_last';
      const middleIndex = Math.floor((players.length - 1) / 2);
      if (players[middleIndex]) players[middleIndex].award = 'middle';
      for (let player of players) {
        if (player.rank === 1) player.award = 'first';
        if (player.rank === 2) player.award = 'second';
        if (player.rank === 3) player.award = 'third';
      }

      return players;
    },
  },
  methods: {
    async getData() {
      const id = '19WkCpZGLbzRrmfmfNF16mI3uIpGZe7NIrkxcknGkD-U';
      const gid = '481070767';
      const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&tq&gid=${gid}`;

      try {
        let response = await fetch(url);
        let text = await response.text();
        let json_string = text.substring(47).slice(0, -2);
        let data = JSON.parse(json_string);
        let rows = data.table.rows;
        let players = rows.map((row) => {
          return {
            name: row.c[0] ? row.c[0].v : '',
            character: row.c[1] ? row.c[1].v : 'Grizzly',
            score: row.c[2] ? row.c[2].v : 0,
          };
        });
        if (players.length === 0) return alert('Error fetching data, please refresh!');
        this.players = players;
      } catch (error) {
        console.error(error);
        return alert('Error fetching data, please refresh!');
      }
    },
    stringToHSLColor(name, saturation = 90, lightness = 45) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }

      const hue = hash % 360;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },
  },
  async mounted() {
    await this.getData();
    setInterval(() => {
      this.getData();
    }, 5000);
  },
});

app.mount('#app');
