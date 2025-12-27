import { config } from "~/config"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 md:py-20">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        Welcome to <span className="text-primary">{config.site.name}</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
        {config.site.description}
      </p>
    </div>
  )
}
