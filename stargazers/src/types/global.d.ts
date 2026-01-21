// src/types/global.d.ts
import { ReactElement } from "react";


interface User {
  id: string;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}
