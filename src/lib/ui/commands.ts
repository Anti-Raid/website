import { CanonicalCommandExtendedData } from "$lib/converters";
import { CanonicalCommand, CanonicalModule, CanonicalCommandData, GuildCommandConfiguration } from "$lib/generated/silverpelt";
import { permuteCommands } from "$lib/mewext/mewext";
import logger from "./logger";

export interface LookedUpCommand {
    command: CanonicalCommand;
    module: CanonicalModule;
}

export const commandLookup = (clusterModules: Record<string, CanonicalModule>, query: string): LookedUpCommand[] => {
    let moduleData = clusterModules;
    if (!moduleData) return [];

    let commands: LookedUpCommand[] = [];

    for (let module of Object.values(moduleData)) {
        for (let command of module?.commands) {
            let checkProps = [
                command?.command?.name,
                command?.command?.qualified_name,
                command?.command?.description,
                ...command?.command?.subcommands?.map((subcommand) => subcommand?.name),
                ...command?.command?.subcommands?.map((subcommand) => subcommand?.qualified_name),
                ...command?.command?.subcommands?.map((subcommand) => subcommand?.description)
            ];

            if (
                checkProps.some((prop) =>
                    prop?.toLowerCase()?.includes(query.toLowerCase())
                )
            ) {
                commands.push({
                    command,
                    module
                });
            }
        }
    }

    return commands;
};

export interface ParsedCanonicalCommandData extends CanonicalCommandData {
    subcommand_depth: number;
    parent_command?: CanonicalCommandData;
    extended_data: CanonicalCommandExtendedData;
    extended_data_map: Record<string, CanonicalCommandExtendedData>;
    search_permissions: string;
    full_name: string;
}

// Returns the name of a command
export const getCommandName = (cmd: ParsedCanonicalCommandData) => {
    return cmd?.subcommand_depth == 0 ? cmd?.name : `${cmd?.parent_command?.name} ${cmd?.name}`;
};

export const extractCommandsFromModule = async (module: CanonicalModule) => {
    let commands: ParsedCanonicalCommandData[] = [];

    // Recursively parse commands
    const parseCommand = (
        command: CanonicalCommandData,
        extended_data: Record<string, CanonicalCommandExtendedData>,
        depth: number = 0,
        parent: CanonicalCommandData | undefined
    ) => {
        let extData = extended_data[depth == 0 ? '' : command?.name] || extended_data[''];
        logger.info('ParseCommand', 'Parsing command', command?.name, depth, parent, extData);
        commands.push({
            ...command,
            subcommand_depth: depth,
            parent_command: parent,
            extended_data: extData,
            extended_data_map: extended_data,
            search_permissions: extData?.default_perms?.checks
                ?.map((check) => check?.kittycat_perms)
                ?.join(', '),
            full_name: depth == 0 ? command?.name : `${parent?.name} ${command?.name}`
        });

        if (command?.subcommands) {
            for (let subcommand of command?.subcommands) {
                parseCommand(subcommand, extended_data, depth + 1, command);
            }
        }
    };

    for (let command of module?.commands) {
        let extData: Record<string, CanonicalCommandExtendedData> = {};

        for (let id in command?.extended_data) {
            extData[id] = {
                id,
                ...command?.extended_data[id]
            };
        }

        logger.info('ParseCommand.ExtData', 'Got extended data', extData);

        parseCommand(command?.command, extData, 0, undefined);
    }

    return commands;
};

/**
 * Derives a list of command configurations for a certain command
 * 
 * @param clusterModules The modules available on the cluster. Used as a fallback when a command configuration is not explicitly set.
 * @param currentCommandConfiguration The current full list of command configurations for the guild
 * @param guildId The guild ID
 * @param command The command to get configurations for
 * @returns 
 */
export const getCommandConfigurations = (clusterModules: Record<string, CanonicalModule>, currentCommandConfiguration: GuildCommandConfiguration[], guildId: string, command: string): GuildCommandConfiguration[] => {
    let ccs = []; // List of command configurations to return

    let permuted_commands = permuteCommands(command);
    let base_command = permuted_commands[0];

    logger.info(
        'GetCommandConfigurations',
        'Getting command configurations for',
        command,
        permuted_commands,
        base_command
    );

    // For each permuted command, find the command configuration
    for (let permuted_command of permuted_commands) {
        let cc = currentCommandConfiguration.find((cmc) => cmc.command == permuted_command);

        if (cc) {
            ccs.push(cc);
            continue;
        }

        // Try falling back to the default command configuration in clusterModules
        for (let module of Object.values(clusterModules)) {
            for (let cmd of module.commands) {
                if (cmd.command.name == base_command || cmd.command.qualified_name == base_command) {
                    // The key on the extended data should be everything but the base command
                    let subcommand: string = permuted_command.split(' ').slice(1).join(' ');

                    logger.info('GetCommandConfigurations', 'Got subcommand from permuted command', {
                        permuted_command,
                        base_command,
                        permuted_commands,
                        subcommand
                    });

                    if (cmd.extended_data[subcommand]) {
                        let cc: GuildCommandConfiguration = {
                            id: '',
                            guild_id: guildId,
                            command: permuted_command,
                            perms: cmd.extended_data[subcommand].default_perms,
                            disabled: !cmd.extended_data[subcommand].is_default_enabled
                        };
                        ccs.push(cc);
                        continue;
                    }

                    // The cmd itself does not exist in extended_data, add a fallback
                    if (cmd.extended_data['']) {
                        let cc: GuildCommandConfiguration = {
                            id: '',
                            guild_id: guildId,
                            command: permuted_command,
                            perms: cmd.extended_data[''].default_perms,
                            disabled: !cmd.extended_data[''].is_default_enabled
                        };
                        ccs.push(cc);
                        continue;
                    } else {
                        // No extended data for this command, add a default configuration
                        logger.info(
                            'GetCommandConfigurations',
                            'Falling back to default configuration for command',
                            {
                                base_command,
                                permuted_command,
                                permuted_commands
                            }
                        );

                        let cc: GuildCommandConfiguration = {
                            id: '',
                            guild_id: guildId,
                            command: permuted_command,
                            perms: {
                                checks: [],
                                checks_needed: 1
                            },
                            disabled: false
                        };
                        ccs.push(cc);
                        continue;
                    }
                }
            }
        }
    }

    logger.info('GetCommandConfigurations', 'Got command configs [ccs]', {
        base_command,
        permuted_commands,
        ccs
    });

    return ccs;
};
