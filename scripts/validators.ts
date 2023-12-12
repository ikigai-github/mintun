import blueprint from "../plutus.json" assert { type: "json" }

// Utility function for fetching a validator from the generated plutus.json
export function getValidator(title: string) {
  const validator = blueprint.validators.find(v => v.title === title)
  if (!validator) {
      throw new Error ('validator not found')
  }

  return validator;
}


