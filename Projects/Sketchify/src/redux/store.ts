import { configureStore } from "@reduxjs/toolkit";
import shapesReducer from "./slice/shapes";
import viewportReducer from "./slice/viewport";
import chatReducer from "./slice/chat";

export const store = configureStore({
	reducer: {
		shapes: shapesReducer,
		viewport: viewportReducer,
		chat: chatReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
