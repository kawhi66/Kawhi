import hCore from "hui-core";
import App from "./App.vue";
import "./reset.css";

const app = hCore({
  extraModelOptions: {
    render: (h) => h(App),
  },
  extraRouterOptions: {
    isNavigable: false,
  },
});

app.start();
