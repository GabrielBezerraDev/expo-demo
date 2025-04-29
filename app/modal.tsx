import { supabase } from "@/services/supabase";
import { useCallback, useEffect, useRef, useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  LayoutChangeEvent,
  Button,
  Module,
  Platform,
} from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryPie,
  VictoryTheme,
  VictoryTooltip,
} from "victory-native";

type Mode = "date" | "time" | "datetime";

async function getFoods(
  startDate: Date,
  endOfDay: Date,
  setThereIsData: React.Dispatch<React.SetStateAction<boolean>>
): Promise<any> {
  let formatData: any[] = [];
  let dataMenuColumns: Record<string, any> = {};
  let response = (await supabase.from("Menu").select(`id, food`)) as any;
  let dataMenu: any = response.data;

  const formatDate = (date: string) => {
    return date.replace(/T|Z/g, " ");
  };

  let startDateFormat: string = formatDate((startDate as Date).toISOString());
  let endDateFormat: string = formatDate((endOfDay as Date).toISOString());

  dataMenu.forEach((menu: any) => {
    dataMenuColumns[menu.food] = {
      key: menu.id,
      label: menu.food,
    };
  });

  let { data, error }: { data: any; error: any } = await supabase
    .from("Order")
    .select(
      `
    Menu!food (id, food)
  `
    )
    .gte("createdAt", startDateFormat)
    .lte("createdAt", endDateFormat);

  if (data) {
    let count: number = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        formatData.some(
          (dataFormat: any) => dataFormat.key === data[i]["Menu"].id
        )
      )
        continue;

      for (let j = 0; j < data.length; j++) {
        if (data[i]["Menu"].id === data[j]["Menu"].id && i !== j) {
          count++;
          setThereIsData(true);
        }
        if (j === data.length - 1) {
          formatData.push({
            ...dataMenuColumns[data[i]["Menu"].food],
            value: count + 1,
          });
          count = 0;
        }
      }
    }

    Object.keys(dataMenuColumns).forEach((key: string) => {
      if (!formatData.some((object: any) => object.label === key)) {
        formatData.push({ ...dataMenuColumns[key], value: 0 });
      }
    });

    formatData.sort((a, b) => b.value - a.value);
  }

  console.log(formatData);

  return formatData.length > 0 ? createColumns(formatData) : [];
}

function createColumns(formatData: any) {
  let columns: any = [];
  formatData.forEach((data: any) => {
    columns.push({ ...data });
  });
  return columns;
}

export default function ModalChart() {
  let currentDate = new Date();
  const [startDate, setStartDate] = useState<Date>(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  let [loading, setLoading] = useState(false);
  let [thereIsData, setThereIsData] = useState(false);
  let [widthView, setWidthView] = useState(0);
  let [dataFoodBar, setDataFoodBar] = useState<any>([]);
  let [dataFoodPie, setDataFoodPie] = useState<any>([]);
  let [dataX, setDataX] = useState<any>();
  let [dataLabels, setDataLabels] = useState<any>();
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [mode, setMode] = useState<Module>("date");

  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(false);
    if (date) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    }
  };

  const renderChartBar = (): React.ReactNode => {
    if (loading) {
      return (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ fontWeight: "bold" }}>Carregando Gráfico</Text>
        </>
      );
    }

    return (
      <>
        <Text style={{ fontWeight: "bold" }}>Gráfico de Barras (Por pedidos):</Text>
        <VictoryChart
          theme={VictoryTheme.material}
          domain={{ y: thereIsData ? undefined : [0, 10] }}
          domainPadding={20}
          animate={{ duration: 1000 }}
        >
          <VictoryAxis tickValues={dataX} tickFormat={dataLabels} />
          <VictoryAxis dependentAxis />
          <VictoryBar
            data={dataFoodBar}
            x="key"
            y="value"
            style={{
              data: {
                fill: ({ datum }) =>
                  datum.value > 15000 ? "#4CAF50" : "#FF5722",
                width: 20,
              },
            }}
          />
        </VictoryChart>
      </>
    );
  };

  const renderChartPie = (): React.ReactNode => {
    if (loading) {
      return (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ fontWeight: "bold" }}>Carregando Gráfico</Text>
        </>
      );
    }

    return (
      <>
        <Text style={{ fontWeight: "bold" }}>Gráfico de Pizza (Porcentagem):</Text>
        <VictoryPie
          theme={VictoryTheme.clean}
          labelRadius={70}
          animate={{ duration: 1000 }}
          data={dataFoodPie}
          style={{
            labels: {
              fill: "#ffff", // Cor do texto (preto)
              fontSize: 12, // Tamanho da fonte
              fontWeight: "bold", // Peso da fonte
            },
          }}
        />
      </>
    );
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(false);
    if (date && date >= startDate) {
      setEndDate(date);
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    if (currentDate) {
      setDate(currentDate);
    }
  };

  const showDatePicker = (currentMode: Mode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  const unravelObjectList = (
    objects: Record<any, any>[],
    ...keys: string[]
  ) => {
    let listObject = objects.map((object: any) => {
      let newObject: Record<any, any> = {};
      for (let key of keys) {
        newObject[key] = object[key];
      }
      return newObject;
    });
    return listObject;
  };

  const formatDataPie = (objects: Record<string, any>[]) => {
    const totalValue: number = objects.reduce(
      (acc: number, obj) => acc + obj.value,
      0
    );

    return objects
      .map((obj) => {
        const porcent = (obj.value * 100) / totalValue;
        return porcent > 0
          ? { x: `${obj.label}\n${porcent.toFixed(2)}%`, y: porcent }
          : null;
      })
      .filter(Boolean); // Remove null/undefined
  };

  const [animationActive, setAnimationActive] = useState(true);

  const loadData = async () => {
    const foodsTemplate = await getFoods(startDate, endDate, setThereIsData);
    setDataFoodBar([...unravelObjectList(foodsTemplate, "key", "value")]);
    setDataFoodPie(
      formatDataPie(unravelObjectList(foodsTemplate, "label", "value"))
    );
    setDataX(
      unravelObjectList(foodsTemplate, "key").map(
        (object: any) => Object.values(object)[0]
      )
    );
    setDataLabels(
      unravelObjectList(foodsTemplate, "label").map(
        (object: any) => Object.values(object)[0]
      )
    );
  };

  const hanldeWithView = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setWidthView(width);
  }, []);

  useEffect(() => {
    setThereIsData(false);
    loadData();
  }, [startDate, endDate]);

  return (
    <Animated.ScrollView
      entering={SlideInRight}
      contentContainerStyle={[styles.container]}
      style={styles.scrollView}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
          justifyContent: "center",
          ...styles.containerChart,
        }}
      >
        <View style={styles.pickerContainer}>
          <Text
            style={styles.dateText}
            onPress={() => setShowStartPicker(true)}
          >
            De: {startDate.toLocaleDateString("pt-BR")}
          </Text>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === "android" ? "calendar" : "inline"}
              onChange={handleStartDateChange}
              maximumDate={endDate}
              locale="pt-BR"
              themeVariant="light"
            />
          )}
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.dateText} onPress={() => setShowEndPicker(true)}>
            Até: {endDate.toLocaleDateString("pt-BR")}
          </Text>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === "android" ? "calendar" : "inline"}
              onChange={handleEndDateChange}
              minimumDate={startDate}
              locale="pt-BR"
              themeVariant="light"
            />
          )}
        </View>
      </View>
      <View style={styles.containerBothCharts}>
        <View onLayout={hanldeWithView} style={styles.containerChart}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
              paddingLeft: 10,
            }}
          >
            {renderChartBar()}
          </View>
        </View>
        <View onLayout={hanldeWithView} style={styles.containerChart}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {renderChartPie()}
          </View>
        </View>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  containerChart: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  containerBothCharts: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    gap: 40,
  },
  scrollView: {
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  container: {
    minHeight: "100%",
    display: "flex",
    backgroundColor: "#ffff",
    paddingBottom: 30,
    gap: 20,
  },
  selectedDate: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  selectedTime: {
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    marginVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#2196F3",
    padding: 10,
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 5,
  },
  navigationButtons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 30,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 10,
  },
});
