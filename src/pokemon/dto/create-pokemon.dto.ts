import { IsInt, IsPositive, IsString, Min, MinLength } from "class-validator";

export class CreatePokemonDto {
    
    @IsInt()
    @IsPositive()
    no: number;

    @IsString({message:'The Name most be a cool string'})
    @MinLength(3)
    name: string;

}
