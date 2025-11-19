import api from "./api"
export const submit = async ({ compoundingChecked, sequencingChecked, profitBasedStopChecked, timeBasedSellChecked }:
    { compoundingChecked: boolean, sequencingChecked: boolean, profitBasedStopChecked: boolean, timeBasedSellChecked: boolean }) => {
    await api.post("/set", {
        COMPOUNDING: String(compoundingChecked),
        SEQUENCING: String(sequencingChecked),
        PROFIT_BASED_STOP: String(profitBasedStopChecked),
        TIME_BASED_SELL: String(timeBasedSellChecked)
    })
    return true
}