import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Bot {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column("text", { default: "#000000" })
    public primaryColour!: string;
}
