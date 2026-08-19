/**
 * @fileoverview Тест на устойчивость загрузки парсера для ExportMap.
 *
 * settings['import-x/parsers'] задаёт парсер КЛЮЧОМ объекта. Если ключ это голое имя
 * пакета, eslint-plugin-import-x прогоняет его через moduleRequire, а тот резолвит в
 * таком порядке: сначала от расположения самого eslint, потом от require.main, и только
 * третьей попыткой от линтуемого файла. В pnpm-монорепозитории первые две попытки уводят
 * в общий хойстнутый стор, где лежит та копия пакета, которая случайно выиграла хойстинг.
 * В результате граф импортов может строиться парсером на несколько мажоров старше того,
 * что объявлен в зависимостях, вплоть до версии, которая не понимает синтаксис текущего
 * TypeScript. Когда такой парсер падает на файле, import-x глотает ошибку, ExportMap
 * остаётся пустым, и no-cycle снова молча ничего не находит.
 *
 * Абсолютный путь такой резолюции не подлежит: moduleRequire отдаёт ровно тот модуль,
 * который резолвил сам пресет из своих зависимостей.
 */

import { library } from '#config';

import assert from 'node:assert';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, test } from 'node:test';

/** Собирает значение ключа settings со всех слоёв пресета. */
const collectSetting = (preset, key) =>
    preset.filter((layer) => layer.settings && key in layer.settings).map((layer) => layer.settings[key]);

describe('ExportMap parser loading', () => {
    test('should key import-x/parsers by resolved absolute path — catches a bare package name, which import-x resolves from eslint rather than from this preset and can answer with a stale hoisted copy', () => {
        const parserSettings = collectSetting(library, 'import-x/parsers');

        assert.ok(parserSettings.length > 0, "пресет не задаёт settings['import-x/parsers']");

        for (const parsers of parserSettings) {
            for (const parserKey of Object.keys(parsers)) {
                assert.ok(
                    path.isAbsolute(parserKey),
                    `ключ '${parserKey}' это не абсолютный путь: import-x будет резолвить его от eslint и может взять чужую копию`
                );
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- parserKey приходит из настроек самого пресета, а не из пользовательского ввода
                assert.ok(existsSync(parserKey), `парсер по пути '${parserKey}' не существует`);
            }
        }
    });
});
