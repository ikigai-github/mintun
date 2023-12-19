import blueprint from "../plutus.json" assert { type: "json" }

// Utility function for fetching a validator from the generated plutus.json
export function getScript(title: string) {
  const script = blueprint.validators.find(v => v.title === title)
  if (!script) {
      throw new Error ('script not found')
  }

  return script;
}


