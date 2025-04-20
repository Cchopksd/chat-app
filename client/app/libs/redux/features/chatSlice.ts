import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  room: string;
}

const initialState: ChatState = {
  room: "",
};
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setViewRoom: (state, action: PayloadAction<string>) => {
      state.room = action.payload;
    },
  },
});

export const { setViewRoom } = chatSlice.actions;
export default chatSlice.reducer;

