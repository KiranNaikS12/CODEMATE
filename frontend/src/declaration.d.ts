//FOR FFMPEG
declare module '@ffmpeg/ffmpeg' {
    export interface FFmpegOptions {
      log?: boolean;
    }
  
    export interface FFmpeg {
      isLoaded(): boolean;
      FS(action: 'writeFile' | 'readFile' | 'unlink', path: string, data?: Uint8Array): Uint8Array;
      load(): Promise<void>;
      run(...args: string[]): Promise<void>;
    }
  
    export function createFFmpeg(options?: FFmpegOptions): FFmpeg;
    export function fetchFile(input: string | File | Blob): Promise<Uint8Array>;
  }