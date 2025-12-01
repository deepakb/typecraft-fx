export interface ITimeManager {
    startLoop(callback: (currentTime: number) => void): void;
    stopLoop(): void;
    wait(ms: number): Promise<void>;
}

export class TimeManager implements ITimeManager {
    private rafId: number | null = null;

    public startLoop(callback: (currentTime: number) => void): void {
        const animate = (currentTime: number) => {
            callback(currentTime);
            this.rafId = window.requestAnimationFrame(animate);
        };
        this.rafId = window.requestAnimationFrame(animate);
    }

    public stopLoop(): void {
        if (this.rafId !== null) {
            window.cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    public wait(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
